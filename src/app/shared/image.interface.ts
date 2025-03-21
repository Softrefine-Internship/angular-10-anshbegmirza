// Interface for image object.
export interface Image {
  title: string;
  description: string | '';
  url: string;
  tags: string[];
  base64: string;
  uploadDate: Date | number;
  size: number;
}
