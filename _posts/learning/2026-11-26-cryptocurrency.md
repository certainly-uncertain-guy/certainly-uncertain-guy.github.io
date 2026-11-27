---
title: "Cryptocurrency"
date: 2026-11-26
categories: [learning]
tags: [cryptography, blockchain]
excerpt: "Building up a cryptocurrency from first principles: a shared ledger, minus trust, plus cryptography."
published: false
---

**Central idea:** Ledger − Trust + Cryptography

## Simplest but less reliable protocol

- Anyone can add a line to a public ledger, like Splitwise
- At the end of some fixed time, people settle up with real money

But anyone can add a line to this ledger without seeking approval of the person owing the money. So we want a mechanism for approving transactions such that it cannot be forged. Only the person who is asked to owe money can approve it.

## Cryptographic solution

Every individual maintains a public key (pk) and secret key (sk) pair.

Unlike a handwritten signature, the digital signature (256-bit message) of the same person on different messages can be different. Basically `Sign(Message, sk) = Signature`. This ensures that only the person with sk can produce that signature for a given message, and that somebody cannot just copy your signature and use it on another message. And then we use `Verify(Message, Signature, pk) = T/F`. The key idea is that you should not be able to produce a signature for a message if you do not know the secret key, except by complete enumeration.

But then someone can copy the same message and signature pair and make multiple entries to the ledger. To avoid this, we ensure that every entry (message) in the ledger has a unique id.

## Updated protocol

- Anyone can add a line to a public ledger, like Splitwise
- At the end of some fixed time, people settle up with real money
- Only signed transactions are valid

But we need to ensure that nobody makes more entries in the ledger of owing than the money they actually have. Therefore we need to keep track of each person's net owed amount to ensure they don't overspend beyond the wealth they have.

Another challenge is that the above protocol has a centralized ledger. But then who will own/maintain the ledger? One solution is that everyone maintains their own ledger. But then, do we broadcast to the whole world every time a transaction happens? If so, how do we ensure that a transaction was recorded properly on all ledgers?

## Protocol

- Broadcast transactions
- Only accept signed transactions
- No overspending
- …

<!-- Images from the Apple Note go here (protocol / hash / block diagrams). -->

## Blocks and mining

Anyone can be a block creator. They listen to transactions and put them in a block. Then they try to find a hash key for the block, and once they find it, they add the block to everyone's ledger. For doing this, they are given a few ledger dollars which do not come from anyone (the block reward). As a result, the overall money keeps on growing. This way everyone need not listen to everyone's transactions; only block creators do. Once they put the block together with a hash code, everyone can update their ledgers with the new block.

<!-- Image from the Apple Note goes here. -->

Creating a block is called mining, since it involves doing a lot of work and introduces new bits of currency into the economy. Miners are basically running a lottery, and whoever finds the key gets the reward. Others, instead of listening for each transaction, just listen for blocks and make a personal copy of the blockchain. When you come across two conflicting blockchains, you simply trust the one which has more work put into it and is thus longer. When both are the same size, wait for one to get longer.

<!-- Images from the Apple Note go here, including: time to find a new block for different currencies. -->

The total number of Bitcoins will not exceed a known limit. Apart from block rewards, miners can also charge transaction fees, which you pay to include your transaction in the ledger.

<!-- Image from the Apple Note goes here. -->

By contrast, Visa processes 1,700 transactions per second and can carry out up to 24,000 per second. This slow processing on BTC leads to higher transaction fees compared to Visa.
