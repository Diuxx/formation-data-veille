export interface MetricCard {
  id: number;
  label: string;
  delta: string;
  value: string;
}

export interface NewsItem {
  id: number;
  source: string;
  title: string;
  description: string;
  image: string;
  link: string;
  tags: string[];
  published: string;
  author: string;
  metrics?: MetricCard[];
}

export interface NewsColumn {
  id: number;
  title: string;
  items: NewsItem[];
}
