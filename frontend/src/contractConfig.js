export const CONTRACT_ADDRESS = "0x8e1034e1CD228DB6a028c3f9F4dA7ba015a67835";

export const CONTRACT_ABI = [
  "function registerProduct(string productId, string name, string origin) public",
  "function addStage(string productId, string stageName, string actor, string location, string notes) public",
  "function getProduct(string productId) public view returns (string name, string origin, address registeredBy)",
  "function getStageCount(string productId) public view returns (uint256)",
  "function getStage(string productId, uint256 index) public view returns (string stageName, string actor, string location, string notes, uint256 timestamp)"
];