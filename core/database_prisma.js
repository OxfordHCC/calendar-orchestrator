import prisma from "./lib/prisma.js";

export async function setUserToken(webid, issuer, id, secret) {
  //TODO: Add `issuer`
    const result = await prisma.user.upsert({
        where: {
          webid: webid,
          issuer: issuer,
        },
        update: {
          token_id: id,
          token_secret: secret,
        },
        create: {
          webid: webid,
          issuer: issuer,
          token_id: id,
          token_secret: secret,
        },
      });
    return result;
}

export async function setCalendarSourceUrl(webid, ics) {
    const result = await prisma.user.upsert({
        where: {
          webid: webid,
        },
        update: {
          ics_url: ics,
        },
        create: {
          webid: webid,
          ics_url: ics,
        },
      });
    return result;
}

export async function deleteUser(webid) {
  const result = await prisma.user.delete({
    where: {
      webid: webid,
    },
  });
  return result;
}

export async function getUserInfo(webid) {
    const info = await prisma.user.findUnique({
        where: {
          webid: webid,
        },
      });
    return { 
        issuer: info["issuer"],
        id: info["token_id"],
        secret: info["token_secret"],
        url: info["ics_url"]
    };
}

export async function userInfoState(webid) {
    const result = await prisma.user.findUnique({
        where: {
          webid: webid,
        },
      });
      
      if (result == null) {
        return {
            user: false,
            ics: false,
        };
      }
    
      if (result["ics_url"] == null) {
        return {
            user: true,
            ics: false,
        };
      }
    
      return {
        user: true,
        ics: true,
      }
}

export async function listUsers() {
  const result = await prisma.user.findMany( {
    select: {
      webid: true,
    }
  });

  return result;
}
