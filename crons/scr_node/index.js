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

    let stackId = await getStackIdByName('Node.js', conn);
    if (!stackId) {
      throw new Error("Stack 'Node.js' not found in database");
    }

    let database = await getDbLastNodeReleases(stackId, conn);
    let data = await getLastNodeReleases(database);

    console.log(data);

    for (const release of data) {
      console.log(`Generating summary for ${release.version}...`);
      const summary = await generateSummary(release.description);
      release.summary = summary;
      console.log(`Summary for ${release.version}:\n${summary}\n`);
    }
    
    // save to database or do something with the data
    if (data.length > 0) {
      await saveToDatabase(data, stackId, conn);
    } 
    else {
      console.log("No new releases to save to database.");
    }

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

async function getDbLastNodeReleases(id, conn) {
  const rows = await conn.query(`
    SELECT sv.stackId, sv.version, sv.releaseDate 
    FROM template_db.stacks s
    INNER JOIN template_db.stack_versions sv on sv.stackId = s.id
    WHERE s.id = ?
    ORDER BY sv.releaseDate DESC   
  `, [id]);

  return rows;
}


async function getLastNodeReleases(database, limit = 4) {
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

  return ghReleases
    .filter(f => desiredSet.has(f.tag_name))
    .filter(f => !dbSet.has(f.tag_name))
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