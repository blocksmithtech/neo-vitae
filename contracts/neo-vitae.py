"""Neo-vitae Smart-Contract

This smart-contract intents to register with the NEO blockchain all user
certificates, diplomas, workplaces and all other achievements during their
lifetime.

Other entities are able to certify that a given address owner has done
something in a permanent way.
"""
from boa.interop.Neo.Runtime import Log, Notify
from boa.interop.Neo.Runtime import CheckWitness
from boa.interop.Neo.Storage import GetContext, Get, Put
from boa.builtins import concat, list, range


# SERIALIZATION METHOS --------------------------------------------------------
#
# First 3 grabbed from "neo-boa" tests:
# https://github.com/CityOfZion/neo-boa/blob/master/boa_test/example/demo/SerializationTest2.py
#
def deserialize_bytearray(data):
    # ok this is weird.  if you remove this print statement,
    # it stops working :/
    # get length of length
    collection_length_length = data[0:1]
    # get length of collection
    collection_len = data[1:collection_length_length + 1]
    # create a new collection
    new_collection = list(length=collection_len)
    # trim the length data
    offset = 1 + collection_length_length

    for i in range(0, collection_len):
        # get the data length length
        itemlen_len = data[offset:offset + 1]
        # get the length of the data
        item_len = data[offset + 1:offset + 1 + itemlen_len]
        # get the data
        item = data[offset + 1 + itemlen_len: offset + 1 + itemlen_len + item_len]
        # store it in collection
        new_collection[i] = item
        offset = offset + item_len + itemlen_len + 1

    return new_collection


def serialize_array(items):
    # serialize the length of the list
    itemlength = serialize_var_length_item(items)
    output = itemlength

    # now go through and append all your stuff
    for item in items:
        # get the variable length of the item
        # to be serialized
        itemlen = serialize_var_length_item(item)
        # add that indicator
        output = concat(output, itemlen)
        # now add the item
        output = concat(output, item)

    # return the stuff
    return output


def serialize_var_length_item(item):
    # get the length of your stuff
    stuff_len = len(item)

    # now we need to know how many bytes the length of the array
    # will take to store

    # this is one byte
    if stuff_len <= 255:
        byte_len = b'\x01'
    # two byte
    elif stuff_len <= 65535:
        byte_len = b'\x02'
    # hopefully 4 byte
    else:
        byte_len = b'\x04'

    out = concat(byte_len, stuff_len)
    return out
#
# END of neo-boa serialization methods
#


def add_delimiter(items):
    """ Concats a list of strings as an JSON array"""
    content = ''
    size = len(items)

    for item in range(0, size):
        new_item = concat(items[item], '***')
        content = concat(content, new_item)

    return content
#
# END OF SERIALIZATION METHODS ------------------------------------------------


# OPERATION FUNCTIONS ---------------------------------------------------------

def get_certs(address):
    """Fetches all certifications for a given address

    returns: a list of certifying user and content
    """
    ctx = GetContext()
    current_data = Get(ctx, address)
    if current_data:
        entries = deserialize_bytearray(current_data)
        final = add_delimiter(entries)
        Notify('Found items, returning them')
    else:
        Notify('No certifications found for this address')
        final = 'Error: No certifications found for this address'
    return final


def add_certification(address, caller_address, content):
    """Writes to the blockchain something about the given address

    returns: success message
    """
    ctx = GetContext()
    current_data = Get(ctx, address)
    new_entry = concat(caller_address, content)
    new_data = []

    if not current_data:
        new_data.append(new_entry)

    else:
        current_data = deserialize_bytearray(current_data)
        current_data.append(new_entry)
        new_data = current_data

    final_data = serialize_array(new_data)
    Put(ctx, address, final_data)
    Log('New certification added.')
    return 'Success: New certification added'

# END OF OPERATION FUNCTIONS --------------------------------------------------


def Main(operation, args):
    """Supports 2 operations

    1.  Consulting the existing data (get)
        > get ["{address}"]
    2.  Inserting data about someone else (certify)
        > certify ["{address}","{hash}"]
    """

    if len(args) == 0:
        Log('You need to provide at least 1 parameter - [address]')
        return 'Error: You need to provide at least 1 parameter - [address]'

    address = args[0]

    if len(address) != 20:
        Log('Wrong address size')
        return 'Error: Wrong address size'

    if operation == 'get':
        return get_certs(address)
    elif operation == 'certify':
        # Caller cannot add certifications to his address
        if CheckWitness(address):
            Log('You cannot add certifications for yourself')
            return 'Error: You cannot add certifications for yourself'
        if 3 != len(args):
            Log('Certify requires 3 parameters - [address] [caller_address] [hash]')
            return 'Error: Certify requires 3 parameters - [address] [caller_address] [hash]'

        caller_address = args[1]
        # To make sure the address is from the caller
        if not CheckWitness(caller_address):
            Log('You need to provide your own address')
            return 'Error: You need to provide your own address'

        content = args[2]
        return add_certification(address, caller_address, content)
    else:
        Log('Invalid Operation')
        return 'Error": "Invalid Operation'
