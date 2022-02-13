import { expect } from "chai";
import { ethers } from "hardhat";

describe("Marketplace", function () {
  let nftContract: any;
  let marketplace: any;
  let owner: any;
  let user2: any;
  let user: any;
  let amount: any;

  before(async function name() {
    const nft = await ethers.getContractFactory("V721");
    const market = await ethers.getContractFactory("Marketplace");
    [owner, user, user2] = await ethers.getSigners();
    nftContract = await nft.deploy();
    await nftContract.deployed();
    marketplace = await market.deploy(nftContract.address);
    await nftContract.deployed();
    await nftContract.setMinter(marketplace.address);
  });

  it("Create item", async function () {
    await marketplace.connect(user).createItem("url-1", "Name1");
    const newItem = await marketplace.getItem(0);
    expect(newItem.owner).to.equal(user.address);
  });
  it("Reverted listItem with zero price", async function () {
    amount = ethers.utils.parseEther("0");
    await expect(marketplace.listItem("0", amount)).to.be.revertedWith(
      "Price must be more them zero."
    );
  });
  it("Reverted listItem with No token is available", async function () {
    const amount = ethers.utils.parseEther("5");
    await expect(marketplace.listItem("0", amount)).to.be.revertedWith(
      "No token is available."
    );
  });
  it("Reverted listItem with You must make approve this token", async function () {
    amount = ethers.utils.parseEther("5");
    await expect(
      marketplace.connect(user).listItem("0", amount)
    ).to.be.revertedWith("You must make approve this token.");
  });
  it("List Item", async function () {
    await nftContract.connect(user).approve(marketplace.address, "0");
    await marketplace.connect(user).listItem("0", amount);
    const items = await marketplace.getListenedItems();
    expect(items.length).to.equal(1);
  });
  it("Second listing", async function () {
    await expect(
      marketplace.connect(user).listItem("0", amount)
    ).to.be.revertedWith("The token is for sale");
  });
  it("Buy myself nft", async function () {
    await expect(
      marketplace.connect(user).buyItem("0", { value: amount })
    ).to.be.revertedWith("It is your token");
  });
  it("Trying to buy cheaper", async function () {
    await expect(
      marketplace
        .connect(user2)
        .buyItem("0", { value: ethers.utils.parseEther("3") })
    ).to.be.revertedWith("Insufficient funds.");
  });
  it("Trying to buy a token not on sale", async function () {
    await expect(
      marketplace.connect(user2).buyItem("1", { value: amount })
    ).to.be.revertedWith("Token is not for sale.");
  });
  it("Buy item", async function () {
    await marketplace.connect(user2).buyItem("0", { value: amount });

    const listItems = await marketplace.getListenedItems();
    expect(listItems.length).to.equal(0);

    const currentItem = await marketplace.getItem("0");

    expect(currentItem.price).to.equal(0);
    expect(currentItem.owner).to.equal(user2.address);
  });
  it("Attempting to send a token to auction, without approve", async function () {
    await expect(
      marketplace.connect(user2).listenItemToAuction("0", amount)
    ).to.be.revertedWith("You must make approve this token.");
  });
  it("Attempting to auction off a token that is already for sale", async function () {
    await nftContract.connect(user2).approve(marketplace.address, "0");
    marketplace.connect(user2).listItem("0", amount);
    await expect(
      marketplace.connect(user2).listenItemToAuction("0", amount)
    ).to.be.revertedWith("The token is for sale");
  });
  it("Cancel listing", async function () {
    await expect(marketplace.connect(user).cancel("0")).to.be.revertedWith(
      "cancel: No token is available."
    );

    await marketplace.connect(user2).cancel("0");

    const listItems = await marketplace.getListenedItems();
    expect(listItems.length).to.equal(0);
  });
  it("Listing to auction no owner", async function () {
    await expect(
      marketplace.connect(user).listenItemToAuction("0", amount)
    ).to.be.revertedWith("No token is available.");
  });
  it("Listing to auction", async function () {
    await marketplace.connect(user2).listenItemToAuction("0", amount);

    const listItems = await marketplace.getAuctionItems();
    expect(listItems.length).to.equal(1);
  });
  it("Cancel Auction no owner", async function () {
    await expect(
      marketplace.connect(user).cancelAuction("0")
    ).to.be.revertedWith("No token is available.");
  });

  it("Cancel Auction", async function () {
    await expect(
      marketplace.connect(owner).cancelAuction("0")
    ).to.be.revertedWith("No token is available.");

    await marketplace.connect(user2).cancelAuction("0");

    const listItems = await marketplace.getAuctionItems();
    expect(listItems.length).to.equal(0);

    const item = await marketplace.getItem("0");
    expect(item.price).to.equal(0);
    expect(item.bidCount).to.equal(0);
    expect(item.buyer).to.equal("0x0000000000000000000000000000000000000000");
  });
  it("Make bid", async function () {
    await marketplace.connect(user2).listenItemToAuction("0", amount);

    amount = ethers.utils.parseEther("10");

    await expect(
      marketplace.connect(user2).makeBid("0", { value: amount })
    ).to.be.revertedWith("You cat't make the bid.");

    amount = ethers.utils.parseEther("3");

    await expect(
      marketplace.connect(user).makeBid("0", { value: amount })
    ).to.be.revertedWith("The bid must be more then current price.");

    amount = ethers.utils.parseEther("6");

    await marketplace.connect(user).makeBid("0", { value: amount });

    const item = await marketplace.getItem("0");

    expect(item.price).to.equal(amount);
    expect(item.bidCount).to.equal(1);
    expect(item.buyer).to.equal(user.address);
  });

  it("Finish auction", async function () {
    await expect(
      marketplace.connect(user).finishAuction("0")
    ).to.be.revertedWith("No token is available.");

    await expect(
      marketplace.connect(user2).finishAuction("0")
    ).to.be.revertedWith("Auction time is not over yet");

    await ethers.provider.send("evm_increaseTime", [5000]);

    await marketplace.connect(user2).finishAuction("0");

    const listItems = await marketplace.getAuctionItems();
    expect(listItems.length).to.equal(0);
  });

  it("Change options", async function () {
    await expect(
      marketplace.connect(user2).setMinBidCount(5)
    ).to.be.revertedWith(
      "AccessControl: account 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc is missing role 0xdf8b4c520ffe197c5343c6f5aec59570151ef9a492f2c624fd45ddde6135ec42"
    );

    await expect(
      marketplace.connect(user2).setAuctionDuration(60)
    ).to.be.revertedWith(
      "AccessControl: account 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc is missing role 0xdf8b4c520ffe197c5343c6f5aec59570151ef9a492f2c624fd45ddde6135ec42"
    );

    await marketplace.connect(owner).setAuctionDuration(60);
  });
});
