// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import formData from '../../mockdata/formData';

type Data = typeof formData;

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  res.status(200).json(formData);
}
