import { AuthenticationError, UserInputError } from 'apollo-server-micro'
import { setLoginSession, getLoginSession } from '../lib/auth'
import { removeTokenCookie } from '../lib/auth-cookies'
import crypto, { randomUUID } from 'crypto'


export const resolvers = {  // Remember to export the resolvers!!
    Query: {
      async viewer(_parent, _args, context, _info) {
        const session = await getLoginSession(context.req)
        try {
          if (session) {
            const currUser = await context.prisma.user.findFirst({
              where: {
                email: session.email
              },
              select: {
                id: true,
                referralCode: true,
                referral: {
                  select: {
                    referred: true,
                  },
                },
              }
            });
            const referralCode = currUser.referralCode
            const referralNo = currUser?.referral?.[0]?.referred
            if (referralNo?.length) {
              return { email: session.email, referralNo: referralNo?.length, referralCode: referralCode }
            } else {
              return { email: session.email, referralNo: 0, referralCode: referralCode }
            }
          }
        } catch (error) {
          throw new AuthenticationError(
            'Authentication token is invalid, please log in'
          )
        }

      },
    },
    Mutation: {
      async onboard (_parent, args, context, _info) {  // Define resolvers as async functions
        const passwordSalt = crypto.randomBytes(16).toString('hex')
        const passwordHash = crypto
          .pbkdf2Sync(args.input.password, passwordSalt, 1000, 64, 'sha512')
          .toString('hex')
          
        async function createUser() {
          const user = await context.prisma.user.create ({ // Always use await for resolvers!!
            data: {
              email: args.input.email,
              passwordHash: passwordHash,
              passwordSalt: passwordSalt,
              referralCode: randomUUID().substring(0, 5)
 
            }
          })
          return user;
        }

        const existingUser = await context.prisma.user.findFirst({
          where: {
            email: args.input.email,
          },
          select: {
            id: true,
          },
        });

        if (existingUser) {
          throw new Error(
            "An account with this email already exists. Please log in.",
          );
        }


        if (args.input.inputReferralCode) {
          const refferedUser = await context.prisma.user.findFirst({
            where: {
              referralCode: args.input.inputReferralCode,
            },
            select: {
              id: true,
            },
          });

          if (!refferedUser) {
            throw new Error( "Referral code is invalid",);
          }

          const newUser = await createUser();
 
          await context.prisma.referral.create({
            data: {
              userId: newUser.id,
              referred: [],
              referredBy: refferedUser.id,
            },
          });
    
          await context.prisma.referral.upsert({
            where: {
              userId: refferedUser.id,
            },
            update: {
              referred: {
                push: newUser.id,
              },
            },
            create: {
              userId: refferedUser.id,
              referred: [newUser.id],
              referredBy: "",
            },
          });
        } else {
          await createUser();
        }
  
        return {email: args.input.email}
      },

      async login(_parent, args, context, _info) {
        const user = await context.prisma.user.findFirst({
            where:{
                email: args.input.email},
        });

        if (!user) {
            throw new UserInputError('User not found');
        }
    
        const inputHash = crypto
          .pbkdf2Sync(args.input.password, user.passwordSalt, 1000, 64, 'sha512')
          .toString('hex')
        const password_match = inputHash == user.passwordHash
        if(!password_match){
            throw new UserInputError('Incorrect Password');
        }

        const session = {
          email: user.email,
          password: user.password
        }

        await setLoginSession(context.res, session)

        return {email: args.input.email};
      },

      async signOut(_parent, _args, context, _info) {
        removeTokenCookie(context.res)
        return true
      }
    },
  }