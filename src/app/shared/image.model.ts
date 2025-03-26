// Interface for image object.
export interface Image {
  id: string;
  title: string;
  description: string;
  url?: string;
  tags: string[];
  base64?: string;
  uploadDate: number;
  size: number;
}
