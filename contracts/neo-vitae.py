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
from boa.code.builtins import concat
from utils.storage import StorageManager


def Main(operation, *args):

    if len(args) == 0:
        Log('You need to provide at least 1 parameter - [address]')
        return ''

    address = args[0]

    if operation == 'get':
        return get_certs(address)
    elif operation == 'certify':
        # Caller cannot add certifications to his address
        if CheckWitness(address):
            Log('You cannot add certitications for yourself')
            return ''
        if 1 == len(args):
            Log('To certify 2 parameters are needed - [address] [content]')
            return ''
        content = args[1]
        return add_certification(address, content)
    else:
        Log('Invalid Operation')
        return ''


def get_certs(address):
    store = StorageManager()
    current_data = store.get(address)
    if current_data:
        Notify(current_data)
    else:
        Notify('No certifications found for this address')
    return current_data


def add_certification(address, content):
    sender = GetCallingScriptHash()
    store = StorageManager()
    current_data = store.get(address)

    if not current_data:
        new_data = concat(sender, content)
    else:
        current_data = store.deserialize_bytearray(current_data)
        new_entry = concat(sender, content)
        current_data.append(new_entry)
        new_data = current_data

    store.put(address, store.serialize_array(new_data))
    Notify('New certification added.', address, content)
    return new_data
