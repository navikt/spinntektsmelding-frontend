import { z } from 'zod';

export default z.object({
  valideringsfeil: z.array(z.string()).optional(),
  error: z.string()
});
