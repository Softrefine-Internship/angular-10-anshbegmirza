// Interface for image object.
export interface Image {
  id: string;
  title: string;
  description: string;
  url?: string;
  tags: string[];
  // tags: { [key: string]: boolean };
  base64?: string;
  uploadDate: number;
  size: number;
}
