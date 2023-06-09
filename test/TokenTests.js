const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Tests uStaking', function () {
  let owner;
  let _refWallet;
  let erc20Contract;
  let Erc20Factory;
  let StakingFactory;
  let stakingContract;
  let user1;
  let user2;
  let user3;
  let user4;

  before(async () => {
    [owner, _refWallet, user1, user2, user3, user4] = await ethers.getSigners();

    Erc20Factory = await ethers.getContractFactory('UStakingToken', owner);
    erc20Contract = await Erc20Factory.deploy();
    await erc20Contract.deployed();

    StakingFactory = await ethers.getContractFactory('UStaking', owner);
    stakingContract = await StakingFactory.deploy(erc20Contract.address, _refWallet.address);
    await stakingContract.deployed();
  });

  it('Should return revorted for zero Address from constructor in erc20 of Ustaking.sol', async function () {
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    const StakingFactory2 = await ethers.getContractFactory('UStaking', owner);
    await expect(StakingFactory2.deploy(zeroAddress, _refWallet.address)).to.be.revertedWith(
      'zero address',
    );
  });

  it('Should return revorted for zero Address from constructor in refWallet of Ustaking.sol', async function () {
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    const StakingFactory2 = await ethers.getContractFactory('UStaking', owner);
    await expect(StakingFactory2.deploy(erc20Contract.address, zeroAddress)).to.be.revertedWith(
      'zero address',
    );
  });

  it('Should be deployed erc20 contract', async function () {
    expect(erc20Contract.address).to.be.properAddress;
  });

  it('Should be deployed staking contract', async function () {
    expect(stakingContract.address).to.be.properAddress;
  });

  it('Should give the role of minter for the stacking contract', async function () {
    const minter = await erc20Contract.MINTER_ROLE();
    await erc20Contract.grantRole(minter, stakingContract.address);
    const isRole = await erc20Contract.hasRole(minter, stakingContract.address);
    expect(isRole).to.be.true;
  });

  it('Should mint staking contract', async function () {
    await erc20Contract.mint(owner.address, 100000000000000000000000n);
    expect(await erc20Contract.totalSupply()).to.eq(ethers.utils.parseEther('150110000'));
  });

  it('Should return the total 150110000 amount at the first mint', async function () {
    const totalSupply = await erc20Contract.totalSupply();
    expect(totalSupply).to.eq(ethers.utils.parseEther('150110000'));
  });

  it('Should return the STK character', async function () {
    const characterToken = await erc20Contract.symbol();
    const nameToken = await erc20Contract.name();
    expect(characterToken).to.eq('uSTK');
    expect(nameToken).to.eq('uStaking');
  });

  it('Should return approve in allowance for owner address', async function () {
    const sumForApprove = ethers.utils.parseEther('1500');
    await erc20Contract.approve('0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2', sumForApprove);
    const allowanceSum = await erc20Contract.allowance(
      owner.address,
      '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2',
    );
    expect(allowanceSum).to.eq(sumForApprove);
  });

  it('Should transfer 2000 tokens from owner to user1', async function () {
    const sumForTransfer = ethers.utils.parseEther('2000');

    await erc20Contract.transfer(user1.address, sumForTransfer);

    const balanceOfUser1 = await erc20Contract.balanceOf(user1.address);

    expect(balanceOfUser1).to.eq(sumForTransfer);
  });

  it('Should transfer 4000 tokens from owner to user2', async function () {
    const sumForTransfer = ethers.utils.parseEther('4000');

    await erc20Contract.transfer(user2.address, sumForTransfer);

    const balanceOfUser2 = await erc20Contract.balanceOf(user2.address);

    expect(balanceOfUser2).to.eq(sumForTransfer);
  });

  it('Should transfer 10000 tokens from owner to user3', async function () {
    const sumForTransfer = ethers.utils.parseEther('10000');

    await erc20Contract.transfer(user3.address, sumForTransfer);

    const balanceOfUser3 = await erc20Contract.balanceOf(user3.address);

    expect(balanceOfUser3).to.eq(sumForTransfer);
  });

  it('Should transfer 5000 tokens from owner to user4', async function () {
    const sumForTransfer = ethers.utils.parseEther('5000');

    await erc20Contract.transfer(user4.address, sumForTransfer);

    const balanceOfUser4 = await erc20Contract.balanceOf(user4.address);

    expect(balanceOfUser4).to.eq(sumForTransfer);
  });

  it('Should approve and stake from user1 for staking', async function () {
    const sumForStake = ethers.utils.parseEther('1000');
    const sumStake = ethers.utils.parseEther('1320'); // + 32%, refferal 25%, staking 5% , cashback 2%
    const sumMinusForStake = ethers.utils.parseEther('-1000');

    await erc20Contract.connect(user1).approve(stakingContract.address, sumForStake);

    const allowanceSum = await erc20Contract.allowance(user1.address, stakingContract.address);

    expect(allowanceSum).to.eq(sumForStake);

    await expect(stakingContract.connect(user1).stake(4, sumForStake)).to.be.revertedWith(
      'invalid stakeType',
    );

    await expect(
      stakingContract.connect(user1).stake(2, ethers.utils.parseEther('0')),
    ).to.be.revertedWith('amount is zero');

    await expect(() => stakingContract.connect(user1).stake(1, sumForStake)).to.changeTokenBalances(
      erc20Contract,
      [user1, stakingContract],
      [sumMinusForStake, sumStake],
    );

    const balanceOfUser1 = await erc20Contract.balanceOf(user1.address);

    expect(balanceOfUser1).to.eq(sumForStake);
  });

  it('Should approve and stake from user2 for staking contract', async function () {
    const sumForStake = ethers.utils.parseEther('1000');
    const sumStake = ethers.utils.parseEther('1320'); // + 32%, refferal 25%, staking 5% , cashback 2%
    const sumMinusForStake = ethers.utils.parseEther('-1000');

    await erc20Contract.connect(user2).approve(stakingContract.address, sumForStake);

    const allowanceSum = await erc20Contract.allowance(user2.address, stakingContract.address);

    expect(allowanceSum).to.eq(sumForStake);

    expect(stakingContract.connect(user2).stake(0, sumForStake)).to.be.revertedWith(
      'invalid stakeType',
    );

    expect(
      stakingContract.connect(user2).stake(2, ethers.utils.parseEther('0')),
    ).to.be.revertedWith('stake more 10 token');

    await expect(() => stakingContract.connect(user2).stake(1, sumForStake)).to.changeTokenBalances(
      erc20Contract,
      [user2, stakingContract],
      [sumMinusForStake, sumStake],
    );

    const balanceOfUser2 = await erc20Contract.balanceOf(user2.address);
    expect(balanceOfUser2).to.eq(ethers.utils.parseEther('3000'));
  });

  it('Should approve and stake from user3 for staking contract', async function () {
    const sumForStake = ethers.utils.parseEther('3000');
    const sumStake = ethers.utils.parseEther('5220'); // + 32%, refferal 25%, staking 5% , cashback 2%
    const sumMinusForStake = ethers.utils.parseEther('-3000');

    await erc20Contract.connect(user3).approve(stakingContract.address, sumForStake);

    const allowanceSum = await erc20Contract.allowance(user3.address, stakingContract.address);

    expect(allowanceSum).to.eq(sumForStake);

    expect(stakingContract.connect(user3).stake(5, sumForStake)).to.be.revertedWith(
      'invalid stakeType',
    );

    expect(
      stakingContract.connect(user3).stake(2, ethers.utils.parseEther('0')),
    ).to.be.revertedWith('amount is zero');

    await expect(() => stakingContract.connect(user3).stake(2, sumForStake)).to.changeTokenBalances(
      erc20Contract,
      [user3, stakingContract],
      [sumMinusForStake, sumStake],
    );

    const balanceOfUser3 = await erc20Contract.balanceOf(user3.address);
    expect(balanceOfUser3).to.eq(ethers.utils.parseEther('7000'));
  });

  it('Should approve and stake from user4 for staking contract', async function () {
    const sumForStake = ethers.utils.parseEther('2500');
    const sumStake = ethers.utils.parseEther('9750'); // + 32%, refferal 25%, staking 5% , cashback 2%
    const sumMinusForStake = ethers.utils.parseEther('-2500');

    await erc20Contract.connect(user4).approve(stakingContract.address, sumForStake);

    const allowanceSum = await erc20Contract.allowance(user4.address, stakingContract.address);

    expect(allowanceSum).to.eq(sumForStake);

    expect(stakingContract.connect(user4).stake(12, sumForStake)).to.be.revertedWith(
      'invalid stakeType',
    );

    expect(
      stakingContract.connect(user4).stake(1, ethers.utils.parseEther('0')),
    ).to.be.revertedWith('amount is zero');

    await expect(() => stakingContract.connect(user4).stake(3, sumForStake)).to.changeTokenBalances(
      erc20Contract,
      [user4, stakingContract],
      [sumMinusForStake, sumStake],
    );

    const balanceOfUser4 = await erc20Contract.balanceOf(user4.address);
    expect(balanceOfUser4).to.eq(sumForStake);
  });

  it('Should return cashBack for user1 in 2% ', async function () {
    const sumForStake = ethers.utils.parseEther('20');
    const sumMinusForStake = ethers.utils.parseEther('-20');

    await expect(() => stakingContract.connect(user1).cashBack(1)).to.changeTokenBalances(
      erc20Contract,
      [user1, stakingContract],
      [sumForStake, sumMinusForStake],
    );
  });

  it('Should return cashBack user2 in 2% ', async function () {
    const sumForStake = ethers.utils.parseEther('20');
    const sumMinusForStake = ethers.utils.parseEther('-20');

    await expect(stakingContract.connect(user2).cashBack(1)).to.be.revertedWith('invalid stake id');

    await expect(() => stakingContract.connect(user2).cashBack(2)).to.changeTokenBalances(
      erc20Contract,
      [user2, stakingContract],
      [sumForStake, sumMinusForStake],
    );

    await expect(stakingContract.connect(user2).cashBack(2)).to.be.revertedWith(
      'cashback already claimed',
    );
  });

  it('Should return cashBack user3 in 2% ', async function () {
    const sumForStake = ethers.utils.parseEther('60');
    const sumMinusForStake = ethers.utils.parseEther('-60');

    await expect(stakingContract.connect(user3).cashBack(1)).to.be.revertedWith('invalid stake id');

    await expect(() => stakingContract.connect(user3).cashBack(3)).to.changeTokenBalances(
      erc20Contract,
      [user3, stakingContract],
      [sumForStake, sumMinusForStake],
    );

    await expect(stakingContract.connect(user3).cashBack(3)).to.be.revertedWith(
      'cashback already claimed',
    );
  });

  it('Should return the percentage for the stake time for user1', async function () {
    await expect(() => stakingContract.connect(user1).claim(1)).to.changeTokenBalances(
      erc20Contract,
      [user1, stakingContract],
      [385802400000000, -385802400000000],
    );
  });

  it('Should return the quantity of stake user1', async function () {
    const stakeLength = await stakingContract.stakeLength(user1.address);
    expect(stakeLength).to.be.eq(1);
  });

  it('Should returns Index in the array by id', async function () {
    const stakeAmount = await stakingContract.stakeAt(user1.address, 0);
    expect(stakeAmount).to.be.eq(1);
  });

  it('Should return all stake IDs to the address.', async function () {
    const stakeAmount = await stakingContract.stakeTotalIds(user1.address);
    expect(Number(stakeAmount[0]._hex)).to.be.eq(1);
  });

  it('Should return new refferal address', async function () {
    const refWallet = await stakingContract.refWallet();
    expect(refWallet).to.be.eq(_refWallet.address);

    await stakingContract.refWalletUpdate(user2.address);

    const newRefWallet = await stakingContract.refWallet();
    expect(newRefWallet).to.be.eq(user2.address);
  });

  it('Should return reverted for not Owner refferal address', async function () {
    const refWallet = await stakingContract.refWallet();
    expect(refWallet).to.be.eq(user2.address);

    expect(stakingContract.connect(user3).refWalletUpdate(user3.address)).to.be.revertedWith(
      'Ownable: caller is not the owner',
    );

    expect(stakingContract.connect(user2).refWalletUpdate(user2.address)).to.be.revertedWith(
      'Ownable: caller is not the owner',
    );
  });

  it('Should return reverted for zeroAddress refferal address', async function () {
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    const refWallet = await stakingContract.refWallet();
    expect(refWallet).to.be.eq(user2.address);
    expect(stakingContract.refWalletUpdate(zeroAddress)).to.be.revertedWith('zero address');
  });

  it('Should withdraw stake amount user1', async function () {
    const sumForStake = ethers.utils.parseEther('1000');
    const sumMinusForStake = ethers.utils.parseEther('-1000');

    await expect(stakingContract.connect(user1).withdraw(1)).to.be.revertedWith(
      'unable to unstake now',
    );

    await ethers.provider.send('evm_increaseTime', [15778458]);
    await ethers.provider.send('evm_mine');

    expect(stakingContract.connect(user1).withdraw(12)).to.be.revertedWith('invalid stake id');

    await expect(await stakingContract.connect(user1).withdraw(1)).to.changeTokenBalances(
      erc20Contract,
      [user1, stakingContract],
      [sumForStake, sumMinusForStake],
    );

    await expect(stakingContract.connect(user1).withdraw(1)).to.be.revertedWith('already claimed');
  });

  it('Should withdraw stake amount user2', async function () {
    const sumForStake = ethers.utils.parseEther('1000');
    const sumMinusForStake = ethers.utils.parseEther('-1000');

    await ethers.provider.send('evm_increaseTime', [15778458]);
    await ethers.provider.send('evm_mine');

    expect(stakingContract.connect(user2).withdraw(12)).to.be.revertedWith('invalid stake id');

    await expect(await stakingContract.connect(user2).withdraw(2)).to.changeTokenBalances(
      erc20Contract,
      [user2, stakingContract],
      [sumForStake, sumMinusForStake],
    );

    await expect(stakingContract.connect(user2).withdraw(2)).to.be.revertedWith('already claimed');
  });

  it('Should withdraw stake amount user3', async function () {
    const sumForStake = ethers.utils.parseEther('3000');
    const sumMinusForStake = ethers.utils.parseEther('-3000');

    await ethers.provider.send('evm_increaseTime', [15778458]);
    await ethers.provider.send('evm_mine');

    expect(stakingContract.connect(user3).withdraw(12)).to.be.revertedWith('invalid stake id');

    await expect(await stakingContract.connect(user3).withdraw(3)).to.changeTokenBalances(
      erc20Contract,
      [user3, stakingContract],
      [sumForStake, sumMinusForStake],
    );

    await expect(stakingContract.connect(user3).withdraw(3)).to.be.revertedWith('already claimed');
  });

  it('Should claim stake amount', async function () {
    await expect(stakingContract.connect(user1).claim(12)).to.be.revertedWith('invalid stake id');
    await expect(await stakingContract.connect(user1).claim(1)).to.changeTokenBalances(
      erc20Contract,
      [user1, stakingContract],
      [299999614197600000000n, -299999614197600000000n],
    );

    expect(await stakingContract.connect(user1).pendingRewards(12)).to.equal(0);
  });

  it('Should check pendingRewards with error id', async function () {
    expect(await stakingContract.connect(user1).pendingRewards(12)).to.equal(0);
  });

  it('Should check getUserData and Total Id for user2', async function () {
    const index = 0;
    const user2Info = await stakingContract.getUserData(user2.address);
    expect(user2Info[index].stakedAmount).to.equal(ethers.utils.parseEther('1000'));
    expect(user2Info[index].stakeType).to.equal(1);
    expect(user2Info[index].cashBackStatus).to.equal(true);
    expect(user2Info[index].withdrawStatus).to.equal(true);

    const totalId = await stakingContract.stakeTotalIds(user2.address);

    expect(totalId.length).to.equal(1);
  });

  it('Should check getUserData and Total Ids for user3', async function () {
    const index = 0;
    const user3Info = await stakingContract.getUserData(user3.address);
    expect(user3Info[index].stakedAmount).to.equal(ethers.utils.parseEther('3000'));
    expect(user3Info[index].stakeType).to.equal(2);
    expect(user3Info[index].cashBackStatus).to.equal(true);
    expect(user3Info[index].withdrawStatus).to.equal(true);
    const totalId = await stakingContract.stakeTotalIds(user3.address);

    expect(totalId.length).to.equal(1);
  });

  it('Should check getUserData and Total Id for user4', async function () {
    const index = 0;
    const user1Info = await stakingContract.getUserData(user4.address);
    expect(user1Info[index].stakedAmount).to.equal(ethers.utils.parseEther('2500'));
    expect(user1Info[index].stakeType).to.equal(3);
    expect(user1Info[index].cashBackStatus).to.equal(false);
    expect(user1Info[index].withdrawStatus).to.equal(false);
    const totalId = await stakingContract.stakeTotalIds(user4.address);

    expect(totalId.length).to.equal(1);
  });

  it('Should return cashBack user4 in 2% ', async function () {
    const sumForStake = ethers.utils.parseEther('50');
    const sumMinusForStake = ethers.utils.parseEther('-50');

    await expect(stakingContract.connect(user4).cashBack(1)).to.be.revertedWith('invalid stake id');

    await expect(() => stakingContract.connect(user4).cashBack(4)).to.changeTokenBalances(
      erc20Contract,
      [user4, stakingContract],
      [sumForStake, sumMinusForStake],
    );

    await expect(stakingContract.connect(user4).cashBack(4)).to.be.revertedWith(
      'cashback already claimed',
    );
  });

  it('Should mint staking contract', async function () {
    const mintRole = await erc20Contract.MINTER_ROLE();

    expect(await erc20Contract.totalSupply()).to.eq(ethers.utils.parseEther('150121985'));
    await expect(erc20Contract.connect(user1).mint(user1.address, 100000)).to.be.reverted;
    await erc20Contract.mint(owner.address, ethers.utils.parseEther('1849878015'));

    await expect(erc20Contract.mint(owner.address, 10)).to.be.revertedWith('max supply exceed');

    await expect(erc20Contract.connect(user1).mint(owner.address, 10)).to.be.revertedWith(
      'AccessControl: account 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6',
    );
  });

  it('Should claim and withdraw stake amount user4', async function () {
    const sumForStake = ethers.utils.parseEther('2500');
    const sumMinusForStake = ethers.utils.parseEther('-2500');

    await ethers.provider.send('evm_increaseTime', [186624000]);
    await ethers.provider.send('evm_mine');

    await expect(stakingContract.connect(user4).claim(12)).to.be.revertedWith('invalid stake id');

    await expect(stakingContract.connect(user4).withdraw(12)).to.be.revertedWith(
      'invalid stake id',
    );

    await expect(await stakingContract.connect(user4).withdraw(4)).to.changeTokenBalances(
      erc20Contract,
      [user4, stakingContract],
      [sumForStake, sumMinusForStake],
    );

    await expect(stakingContract.connect(user4).withdraw(4)).to.be.revertedWith('already claimed');
  });
  it('Should check getUserData for user4 after withdraw and cashBack', async function () {
    const index = 0;
    const user1Info = await stakingContract.getUserData(user4.address);
    expect(user1Info[index].stakedAmount).to.equal(ethers.utils.parseEther('2500'));
    expect(user1Info[index].stakeType).to.equal(3);
    expect(user1Info[index].cashBackStatus).to.equal(true);
    expect(user1Info[index].withdrawStatus).to.equal(true);
    const totalId = await stakingContract.stakeTotalIds(user4.address);

    expect(totalId.length).to.equal(1);
  });
});
