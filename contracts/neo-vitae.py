"""Neo-vitae Smart-Contract

This smart-contract intents to register with the NEO blockchain all user
certificates, diplomas, workplaces and all other achievements during their
lifetime.

Other entities are able to certify that a given address owner has done
something in a permanent way.
"""
from boa.blockchain.vm.Neo.Runtime import Log, Notify
from boa.blockchain.vm.Neo.Runtime import CheckWitness
from boa.blockchain.vm.System.ExecutionEngine import GetCallingScriptHash
from boa.code.builtins import concat, substr
from utils.storage import StorageManager


def Main(operation, args):
    """Supports 2 operations

    Consulting the existing data
    And inserting data about someone else
    """

    if len(args) == 0:
        Log('You need to provide at least 1 parameter - [address]')
        return ['Error']

    address = args[0]

    if operation == 'get':
        return get_certs(address)
    elif operation == 'certify':
        # Caller cannot add certifications to his address
        if CheckWitness(address):
            Log('You cannot add certitications for yourself')
            return ['Error']
        if 1 == len(args):
            Log('To certify 2 parameters are needed - [address] [content]')
            return ['Error']
        content = args[1]
        return add_certification(address, content)
    else:
        Log('Invalid Operation')
        return ['Error']


def get_certs(address):
    """Fetches all certifications for a given address

    return a list of certifying user and content
    """
    store = StorageManager()
    current_data = store.get(address)
    final = []
    if current_data:
        entries = store.deserialize_bytearray(current_data)
        # for entry in entries:
        #     sender_address = substr(entry, 0, 34)
        #     length = len(entry) - 34
        #     content = substr(entry, 34, length)
        #     final.append([sender_address, content])
        final = entries
        Notify(final)
    else:
        Notify('No certifications found for this address')
        final.append('Error')
    return final


def add_certification(address, content):
    """Writes to the blockchain something about the given address

    returns the existing data
    """
    sender = GetCallingScriptHash()
    store = StorageManager()
    current_data = store.get(address)
    new_entry = concat(sender, content)

    if not current_data:
        new_data = [new_entry]
    else:
        current_data = store.deserialize_bytearray(current_data)
        current_data.append(new_entry)
        new_data = current_data

    final_data = store.serialize_array(new_data)
    store.put(address, final_data)
    Notify('New certification added.', address, content)
    return [final_data]
