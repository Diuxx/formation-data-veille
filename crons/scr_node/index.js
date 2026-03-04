import "dotenv/config";
import fetch from "node-fetch";
import * as mariadb from "mariadb";
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

async function main() {
  console.log("Testing database connection...");

  const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
    connectionLimit: 5,
  });

  let conn;
  try {
    conn = await pool.getConnection();

    const rows = await conn.query("SELECT 1 + 1 AS result");
    console.log("Database connection test result:", rows);

    if (rows[0]?.result === 2) {
      console.log("Database connection successful!");
    } 
    else {
      throw new Error("Unexpected database response");
    }

    await processStack('Node.js', conn, getLastNodeReleases);
    await processStack('Angular', conn, getLastAngularReleases);
    await processStack('MariaDB', conn, getLastMariaDbReleases);

    process.exit(0);
  } 
  catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  } 
  finally {
    if (conn) conn.end();
  }

}

main();

/**
 * 
 * @param {*} releases 
 * @param {*} id 
 * @param {*} conn 
 */
async function saveToDatabase(releases, id, conn) {
  let query = `
    INSERT INTO stack_versions (id, stackId, version, releaseDate, notes, isLts, tags, icon)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  await conn.beginTransaction();
  try {
    for (const r of releases) {
      const rowId = uuidv4();
      const tags = JSON.stringify(r.tags ?? []);
      await conn.query(query, [
        rowId,
        id,
        r.version,
        new Date(r.date),
        r.summary,
        Boolean(r.isLts),
        tags,
        r.icon ?? null
      ]);
    }
    await conn.commit();
  } 
  catch (e) {
    await conn.rollback();
    console.error("Error saving to database:", e);
    throw e;
  }
  console.log(`All data has been saved to the database successfully.`);
}

async function getStackIdByName(name, conn) {
  const rows = await conn.query(`
    SELECT id FROM stacks WHERE name = ? LIMIT 1
  `, [name]); 
  return rows[0]?.id ?? null;
}

async function processStack(stackName, conn, fetchReleasesFn) {
  const stackId = await getStackIdByName(stackName, conn);
  if (!stackId) {
    console.warn(`Stack '${stackName}' not found in database, skipping...`);
    return;
  }

  const database = await getDbLastReleases(stackId, conn);
  const data = await fetchReleasesFn(database);

  console.log(`[${stackName}] New releases found: ${data.length}`);

  for (const release of data) {
    console.log(`[${stackName}] Generating summary for ${release.version}...`);
    const summary = await generateSummary(release.description);
    release.summary = summary;
  }

  if (data.length > 0) {
    await saveToDatabase(data, stackId, conn);
  }
  else {
    console.log(`[${stackName}] No new releases to save to database.`);
  }
}

async function getDbLastReleases(id, conn) {
  const rows = await conn.query(`
    SELECT sv.stackId, sv.version, sv.releaseDate 
    FROM stacks s
    INNER JOIN stack_versions sv on sv.stackId = s.id
    WHERE s.id = ?
    ORDER BY sv.releaseDate DESC   
  `, [id]);

  return rows;
}

async function getLastNodeReleases(database, limit = 3) {
  const [ghReleases, nodeRes] = await Promise.all([
    fetch(process.env.NODE_URL).then(res => res.json()),
    fetch(process.env.NODE_DIST_URL).then(res => res.json())
  ]);

  const desiredVersions = nodeRes
    .filter(f => f.lts)
    .slice(0, limit)
    .map(v => v.version);

  const desiredSet = new Set(desiredVersions);

  // 2) Index DB pour éviter O(n²)
  const dbSet = new Set((database ?? []).map(d => d.version));
  const newReleases = ghReleases
    .filter(release => desiredSet.has(release.tag_name))
    .filter(release => !dbSet.has(release.tag_name));

  return newReleases
    .map(r => ({
      version: r.tag_name,
      name: r.name,
      url: r.html_url,
      date: r.published_at,
      description: r.body,
      isLts: true,
      summary: '', // To be filled later
      dbId: ''
  }));
}

async function getLastAngularReleases(database, limit = 3) {
  const angularUrl = process.env.ANGULAR_URL || 'https://api.github.com/repos/angular/angular/releases';
  const angularDistUrl = process.env.ANGULAR_DIST_URL || 'https://registry.npmjs.org/@angular/cli';

  const [releases, angularDist] = await Promise.all([
    fetch(angularUrl).then(res => res.json()),
    fetch(angularDistUrl).then(res => res.json())
  ]);

  const distTags = angularDist?.['dist-tags'] ?? {};
  const ltsVersions = Object.entries(distTags)
    .filter(([tag]) => /lts/i.test(tag))
    .map(([, version]) => normalizeVersion(version));

  const ltsSet = new Set(ltsVersions);
  const dbSet = new Set((database ?? []).map(d => normalizeVersion(d.version)));

  const latestReleases = releases
    .filter(release => !release.draft && !release.prerelease)
    .slice(0, limit)
    .filter(release => !dbSet.has(normalizeVersion(release.tag_name)));

  return latestReleases
    .map(release => ({
      version: release.tag_name,
      name: release.name,
      url: release.html_url,
      date: release.published_at,
      description: release.body,
      isLts: ltsSet.has(normalizeVersion(release.tag_name)),
      summary: '',
      dbId: ''
    }));
}

async function getLastMariaDbReleases(database, limit = 3) {
  const mariaDbUrl = process.env.MARIADB_URL || 'https://api.github.com/repos/MariaDB/server/releases';
  const releases = await fetch(mariaDbUrl).then(res => res.json());

  const dbSet = new Set((database ?? []).map(d => d.version));

  return releases
    .filter(release => !release.draft && !release.prerelease)
    .slice(0, limit)
    .filter(release => !dbSet.has(release.tag_name))
    .map(release => ({
      version: release.tag_name,
      name: release.name,
      url: release.html_url,
      date: release.published_at,
      description: release.body,
      isLts: false,
      summary: '',
      dbId: ''
    }));
}

async function generateSummary(info = '') {
  if (!info) {
    return "No information provided.";
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    // -- Generate a summary of the latest Node.js releases if needed.

    const prompt = `
      Tu es un générateur de résumé pour alimenter une veille technique sur la sortie de version de différents outils informatique.

      OBJECTIF :
      Produire un résumé de 3-4 lignes digest de la lecture des "notable changes" et des commit du repos que je te partage.

      CONTRAINTES :
      - Réponds avec uniquement du texte.
      - aucun espace ou retour à la ligne inutile.
      - Pas de paragraphes prolixes : phrases courtes, factuelles.
      - repond en français.

      QUALITÉ ATTENDUE :
      - Résumé de 3-4 lignes maximum.
      - Résumé factuel, sans interprétation ni jugement de valeur.
      - Ton neutre, précis.
      - Jamais de spéculation ou d'opinion personnelle.

      Réponds maintenant avec le résumé du texte ci-dessous :

      ${info}
    `;
    const result = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      max_output_tokens: 4000
    });

    return result.output_text.trim();
  } 
  catch (error) {
    console.error("Error generating summary:", error);
  }
}

function formatDateForMariaDB(dateString) {
  return new Date(dateString)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
}

function normalizeVersion(version = '') {
  return String(version).trim().replace(/^v/i, '');
}