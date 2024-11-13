const XOR_CODE = 23442827791579n;
const MASK_CODE = 2251799813685247n;
const MAX_AID = 1n << 51n;
const BASE = 58n;

const data = 'FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf';

// Convert AV ID to BV ID
function av2bv(aid) {
  const bytes = ['B', 'V', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0'];
  let bvIndex = bytes.length - 1;
  let tmp = (MAX_AID | BigInt(aid)) ^ XOR_CODE;

  while (tmp > 0) {
    bytes[bvIndex] = data[Number(tmp % BASE)];
    tmp = tmp / BASE;
    bvIndex -= 1;
  }

  // Swap the positions as required by the algorithm
  [bytes[3], bytes[9]] = [bytes[9], bytes[3]];
  [bytes[4], bytes[7]] = [bytes[7], bytes[4]];

  return bytes.join('');
}

// Convert BV ID to AV ID
function bv2av(bvid) {
  const bvidArr = Array.from(bvid);

  // Swap the positions as required by the algorithm
  [bvidArr[3], bvidArr[9]] = [bvidArr[9], bvidArr[3]];
  [bvidArr[4], bvidArr[7]] = [bvidArr[7], bvidArr[4]];

  bvidArr.splice(0, 3); // Remove 'BV1' prefix
  const tmp = bvidArr.reduce((pre, bvidChar) => pre * BASE + BigInt(data.indexOf(bvidChar)), 0n);
  return Number((tmp & MASK_CODE) ^ XOR_CODE);
}

module.exports = {
  av2bv,
  bv2av
};
