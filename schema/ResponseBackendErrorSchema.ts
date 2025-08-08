import { z } from 'zod/v4';

export default z.object({
  valideringsfeil: z.array(z.string()),
  error: z.string()
});
