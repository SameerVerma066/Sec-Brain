const ALPHANUMERIC =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function random(length: number): string {
  let ans = "";

  for (let i = 0; i < length; i += 1) {
    ans += ALPHANUMERIC[Math.floor(Math.random() * ALPHANUMERIC.length)];
  }

  return ans;
}
