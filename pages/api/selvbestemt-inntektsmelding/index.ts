import handler from './[postId]';

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false
  }
};
export default handler;
