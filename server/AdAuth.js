import ldap from "ldapjs";

export async function adAuthenticate(username, password) {
  const client = ldap.createClient({
    url: ["LDAP://dcmkho.ds.indianoil.in:389"],
    reconnect: true,
    timeout: 5000,
  });

  return new Promise((resolve) => {
    client.bind(`${username}@ds.indianoil.in`, password, (err) => {
      if (err) {
        console.error("LDAP Authentication failed:", err);
        client.unbind();
        return resolve(false);
      }

      console.log("LDAP Authentication successful");
      client.unbind();
      resolve(true);
    });
  });
}
