import handler from './[postid]';

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false
  }
};
export default handler;
