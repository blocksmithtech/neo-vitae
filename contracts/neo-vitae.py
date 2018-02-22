"""Neo-vitae Smart-Contract

This smart-contract intents to register with the NEO blockchain all user
certificates, diplomas, workplaces and all other achievements during their
lifetime.

Other entities are able to certify that a given address owner has done
something in a permanent way.

Usage:

- Add later

"""
from boa.blockchain.vm.Neo.Runtime import Log, Notify
from boa.blockchain.vm.Neo.Runtime import CheckWitness
from boa.blockchain.vm.Neo.Storage import GetContext, Get, Put, Delete


def Main():
    Log("Neo-Vitae")
    Notify("We are just getting started")
