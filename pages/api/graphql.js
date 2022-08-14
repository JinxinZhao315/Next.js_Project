import { ApolloServer } from 'apollo-server-micro'
import { schema } from '../../apollo/schema'
import Cors from 'micro-cors';
import prisma from '../../lib/prisma'

const cors = Cors();

const apolloServer = new ApolloServer({
  schema,
  context: ({req, res}) => {
    return{
      prisma,
      req,
      res
    }
  },
})

const startServer = apolloServer.start();

export default cors(async function handler(req, res) {
    await startServer;
    await apolloServer.createHandler({
        path:'/api/graphql',
    })(req, res);
});

export const config = {
    api: {
      bodyParser: false,
    },
  }
