NEO-Vitae
=========

NEO-Vitae is a Curriculum Vitae platform that uses NEO blockchain and smart contracts, so that the viewers can automatically verify the validity of certificates, previous employers and other stuff, with all the assurances provided by a public blockchain.

This project started in a attempt to participate in the 2nd dApp competition organized by [City of Zion](https://cityofzion.io/dapps/2). However given the time constrains ended as entry to the [1st NEO Dev Competition](https://neo.org/competition.html)

# Components

This project is contains 2 components.

1. **Smart Contract** - This contract is used to write the certification statements to the Blockchain and provide an easy way to access those certifications.

2. **Client-side web app** - that connects to any node in the network that provides a JSON-RPC feature and retrieves the information about some person/entity. With that data and fetching any extra information that might enrich the available data (validated by what is in the blockchain), it generates a curriculum page.


# Dependencies

This initial deployment used the [`neo-python`](https://github.com/blocksmithtech/neo-vitae) client and SDK to compile and invoke the smart-contract. 

For the `dApp`, the [neo-api-js](https://github.com/CityOfZion/neo-api-js) library was initially used, However in a more advanced phase of the development this supporting library was replaced by [neon-js](https://github.com/CityOfZion/neon-js)


# How to deploy and use the smart-contract in a private network

**Step1** - after cloning the repository, launch your `neo-python` client and build the smart-contract:

> neo> build {path_to}/neo-vitae.py test 0710 07 True False get ["{wallet address}"]

**Step2** - Import the contract to the blockchain:

> neo> import contract {path_to}/neo-vitae.avm 0710 07 True False

**Step3** - Search for the contract and grab the hash:

> neo> contract search {the_name_you_gave_to_the_contract}

**Step4** - Invoke the contract. There are 2 operations `certify` and `get` that should be invoked this way:

> neo> testinvoke {contract_hash_here} certify ["{wallet_to_certify}","{own_wallet_address}","{hash_that_of_the_contents}"]

and 

> neo> testinvoke {contract_hash_here} get ["{about_wallet}"] 

The `get` is used to find information about a given wallet/entity. The `certify` operation should be invoked by any organization/entity that wants to publicly declare that another entity has achieved/done something.

# How it works

Neo-Vitae uses 2 decentralized technologies to achieve its core function, which is to store in a permanent and distributed manner the information about a person's curriculum. 

We use the [NEO blockchain](https://www.neo.org) and the wallet's public and private keys to store and verify that a given "entity" has something to say (certify) about another entity.

The data is stored on the blockchain like this of each entry:

```
{byte array script hash of the certifier}{IPFS Hash of the certification document}
```

The size of the content that constitutes the certification is "unlimited" because we use the other technology, [IPFS](https://ipfs.io), to store the data. Letting only its `hash` be stored on the blockchain.

At the moment the format of the data recognized by our example "viewer" (dApp) is the following:

```
{
  "name": "{Name of the entity being certified}",
  "certifier": "{Name of the entity issuing the certification}",
  "from": "{Optional initial date}",
  "to": "{Required date}",
  "certification": "{Name of the certification}",
  "description": "Longer description here",
  "extra": [
    "List of strings with extra information that might be needed",
    "this field is optional and should be an empty array when",
    "there isn't any content present."
  ]
}

```

In this `alpha` phase the curriculum's can be seen using the demonstration dApp but the certification must done manually, though the invocation of the smart-contract (check the previous section).

In the future we hope the be able to make this process easier and more intuitive through the dApp.


# More information

During the development of this project, we found many "gotchas" like things lack of the documentation, information spread in to many places, things that worked differently than it was expected, etc. We summarized some of the in a blog post. You can find it [here](https://medium.com/blocksmithtech/developing-smart-contracts-with-neo-python-what-we-learned-680d1da6bbf3).

