const DB = {
  users: [
    {
      user: 1234,
      coords: {
        longitude: 8.643549521904836,
        latitude: 47.44843742196516
      }
    },
    {
      user: 1234,
      coords: {
        longitude: 8.616012193490475,
        latitude: 47.42646189730595
      }
    },
    {
      user: 1234,
      coords: {
        longitude: 8.569956124826192,
        latitude: 47.43536359745352
      }
    },

    {
      user: 1234,
      coords: {
        longitude: 8.564726003365019,
        latitude: 47.40482508149379
      }
    },

    { user: "Work", coords: { latitude: 47.392399, longitude: 8.524558 } }
  ],
  color: "orange"
};

const delay = async ms => {
  await new Promise((resolve, reject) => {
    setTimeout(() => resolve(console.log("foo done")), ms);
  });
};

const midPoint = (p1, p2) => {
  let lat = (p1.coords.latitude + p2.coords.latitude) / 2;
  let lng = (p1.coords.longitude + p2.coords.longitude) / 2;
  return { coords: { latitude: lat, longitude: lng } };
};

const dist = (p1, p2) => {
  const p12 = Math.pow(p1.coords.latitude - p2.coords.latitude, 2);
  const p22 = Math.pow(p1.coords.longitude - p2.coords.longitude, 2);
  return Math.sqrt(p12 + p22);
};

exports.modelData = async (ctx, next) => {
  DB.center = midPoint(DB.users[0], DB.users[4]);
  DB.dist = dist(DB.users[0], DB.users[4]);
  await delay(5000);
  ctx.response.body = await DB;
};
