// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import org from '../../mockdata/testOrganisasjoner';

type Data = typeof org;

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  res.status(200).json(org);
}
