"""Neo-vitae Smart-Contract

This smart-contract intents to register with the NEO blockchain all user
certificates, diplomas, workplaces and all other achievements during their
lifetime.

Other entities are able to certify that a given address owner has done
something in a permanent way.

Test:


Import:


Usage:



- Add later

"""
from boa.blockchain.vm.Neo.Runtime import Log, Notify
from boa.blockchain.vm.Neo.Runtime import CheckWitness
from boa.blockchain.vm.Neo.Storage import GetContext, Get, Put
from boa.blockchain.vm.System.ExecutionEngine import GetCallingScriptHash


def Main(operation, *args):

    if len(args) == 0:
        Log('You need to provide the parameters')
        return ''

    address = args[0]

    if operation == 'get':
        return get_certs(address)
    elif operation == 'certify':
        # Caller cannot add certifications to his address
        if CheckWitness(address):
            Log('You cannot add certitications for yourself')
            return ''

        content = args[1]
        return add_certification(address, content)
    else:
        Log('Invalid Operation')
        return ''


def get_certs(address):
    context = GetContext()
    current_data = Get(context, address)
    if current_data:
        Notify(current_data)
    else:
        Notify('No certifications found for this address')
    return current_data


def add_certification(address, content):
    sender = GetCallingScriptHash()
    context = GetContext()
    current_data = Get(context, address)

    if not current_data:
        new_data = sender + content
    else:
        new_data = current_data

    Put(context, address, new_data)
    Notify('New certification added.', address, content)
    return new_data
