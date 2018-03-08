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
from boa.interop.System.ExecutionEngine import GetCallingScriptHash
from boa.builtins import concat, list, range, substr


# Serialization methods, grabbed from "neo-boa" tests

def deserialize_bytearray(data):
    # ok this is weird.  if you remove this print statement, it stops working :/
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


def simple_json_object(key, value):
    content = '{'
    obj_key = concat('"', concat(key, '"'))
    obj_value = concat('"', concat(value, '"'))
    delimiter = concat(obj_key, ':')
    content = concat(content, concat(delimiter, obj_value))
    return concat(content, '}')


def json_array(items):
    content = '['
    size = len(items)

    for item in range(0, size):
        content = concat(content, items[item])
        if item != size - 1:
            content = concat(content, ',')

    return concat(content, ']')

# END OF SERIALIZATION METHODS


def entries_json_objects(entries):
    objects = []
    for entry in entries:
        sender_address = substr(entry, 0, 40)
        content = substr(entry, 40, len(entry) - 40)
        objects.append(simple_json_object(sender_address, content))
    return objects


def get_certs(address):
    """Fetches all certifications for a given address

    return a list of certifying user and content
    """
    ctx = GetContext()
    current_data = Get(ctx, address)
    if current_data:
        entries = deserialize_bytearray(current_data)
        objects = entries_json_objects(entries)
        final = json_array(objects)
        Notify(final)
    else:
        Notify('No certifications found for this address')
        final = '[{"error": "No certifications found for this address"}]'
    return final


def add_certification(address, content):
    """Writes to the blockchain something about the given address

    returns the existing data
    """
    sender = GetCallingScriptHash()
    ctx = GetContext()
    current_data = Get(ctx, address)
    new_entry = concat(sender, content)
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

    return json_array(entries_json_objects(new_data))


def Main(operation, args):
    """Supports 2 operations

    1.  Consulting the existing data (get)
        > get ["{address}"]
    2.  Inserting data about someone else (certify)
        > certify ["{address}","{hash}"]
    """

    if len(args) == 0:
        Log('You need to provide at least 1 parameter - [address]')
        return '[{"error": "You need to provide at least 1 parameter - [address]"}]'

    address = args[0]

    if operation == 'get':
        return get_certs(address)
    elif operation == 'certify':
        # Caller cannot add certifications to his address
        if CheckWitness(address):
            Log('You cannot add certitications for yourself')
            return '[{"error": "You cannot add certitications for yourself"}]'
        if 1 == len(args):
            Log('To certify 2 parameters are needed - [address] [hash]')
            return '[{"error": "To certify 2 parameters are needed - [address] [hash]"}]'

        content = args[1]
        return add_certification(address, content)
    else:
        Log('Invalid Operation')
        return '[{"error": "Invalid Operation"}]'
