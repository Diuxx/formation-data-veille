export type ToolArticleCategory =
  | 'Sites utiles'
  | 'Base de données'
  | 'IDE'
  | 'Maquettes';

export interface ToolArticle {
  id: number;
  title: string;
  description: string;
  age: string;
  author: string;
  image: string;
  link: string;
  category: ToolArticleCategory;
}
