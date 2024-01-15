import path from 'path';
import { fileURLToPath } from 'url';

export const dirname = (url) => {
  const __filename = fileURLToPath(url);
  return path.dirname(__filename); 
}