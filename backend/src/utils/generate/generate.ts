// generate user seed to use with generate user
// profile in the frontend
export function generateUserSeed(user_name: string): string {
  const cleanName = user_name.trim().split(" ").join("");
  let seed = "";

  for (let i = 0; i < 10; i++) {
    const index = Math.floor(Math.random() * cleanName.length);
    const shouldUpper = Math.floor(Math.random() * 2);

    const letter = shouldUpper
      ? cleanName[index].toUpperCase()
      : cleanName[index].toLocaleLowerCase();

    seed += letter;
  }

  return seed;
}
