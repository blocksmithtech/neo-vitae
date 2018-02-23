NEO-Vitae
=========

NEO-Vitae is a Curriculum Vitae platform that uses NEO blockchain and smart contracts, so that the viewers can automatically verify the validity of certificates, previous employers and other stuff, with all the assurances provided by a public blockchain.

This project started in a attempt to participate in the 2nd dApp competition organized by [City of Zion](https://cityofzion.io/dapps/2). 

# Components

This project is contains 2 components.

1. **Smart Contract** - This contract is used to write the certification statements to the Blockchain and provide an easy way to access those certifications.

2. **Client-side web app** - that connects to any node in the network that provides a JSON-RPC feature and retrieves the information about some person/entity. With that data and fetching any extra information that might enrich the available data (validated by what is in the blockchain), it generates a curriculum page.


# Dependencies

This initial deployment used the [`neo-python`](https://github.com/blocksmithtech/neo-vitae) client and SDK to compile and invoke the smart-contract. 

For the `dApp`, the [neo-api-js](https://github.com/CityOfZion/neo-api-js) library was initially used, However in a more advanced phase of the development this supporting library was replaced by [neon-js](https://github.com/CityOfZion/neon-js)


# How to deploy and use in a private network

**Step1** - after cloning the repository, launch your `neo-python` client and build the smart-contract:

> neo> build {path_to}/neo-vitae.py test 0710 05 True False get ["{wallet address}"]

**Step2** - Import the contract to the blockchain:

> neo> import contract {path_to}/neo-vitae.avm 0710 05 True False

**Step3** - Search for the contract and grab the hash:

> neo> contract search {the_name_you_gave_to_the_contract}

**Step4** - Invoke the contract. There are 2 operations `certify` and `get` that should be invoked this way:

> neo> testinvoke {contract_hash_here} certify ["{wallet_to_certify}","{data_about_the_certification}"]

and 

> neo> testinvoke {contract_hash_here} get ["{about_wallet}"] 

The `get` is used to find information about a given wallet/entity. The `certify` operation should be invoked by any organization/entity that wants to publicly declare that another entity has achieved/done something.


# How to deploy and use the dApps

More information Later


# More information

During the development of this project, we found many "gotchas" like things lack of the documentation, information spread in to many places, things that worked differently than it was expected, etc. We summarized some of the in a blog post. You can find it [here]().
