# WebORM Docs

## WebORM constructor reference

### `WebORM(schema, config)`
WebORM constructor.
* `schema`: { }.
  * Keys are entity names and values are SchemaEntity objects.
* `config`: { }.
  * Valid keys and values:
    * `pluralization`: object where keys are entity names and values are how you want them pluralized, if they don't follow the pattern of just adding an 's' at the end of the word.

**Returns:** The WebORM object.

### `WebORM.SchemaEntity(attrs, relsToOne, relsToMany)`
SchemaEntity objects constructor.
* `attrs`: [ String ]. Attributes names for a given entity.
* `relsToOne`: [ String ]. Names of other SchemaEntity to which this entity will have a 'to one' relationship'.
* `relsToMany`: [ String ]. Names of other SchemaEntity to which this entity will have a 'to many' relationship'.

**Returns:** SchemaEntity object.


## WebORM reference

### `weborm.save(entity, data)`
Inserts a record, or update (replace) a record if `data` contains an id of a existing record.
* `entity`: String. Entity name.
* `data`: {} or WebORMEntity object. Data to be stored. Only attributes that match the schema for that entity will be persisted.

**Returns:** WebORMEntity object.

### `weborm.find(entity, id)`
Retrieves a single record by its entity and id.
* `entity`: String. Entity name.
* `id`: Number. Record id.

**Returns:** WebORMEntity object or `undefined`.

### `weborm.all(entity)`
Retrieves all records of an entity.
* `entity`: String. Entity name.

**Returns:** [ WebORMEntity ].

### `weborm.count(entity)`
Counts the number of records of an entity.
* `entity`: String. Entity name.

**Returns:** Number.

### `weborm.first(entity)`
Retrieves the first record of an entity, ordered by id.
* `entity`: String. Entity name.

**Returns:** WebORMEntity object or `undefined`.

### `weborm.last(entity)`
Retrieves the last record of an entity, ordered by id.
* `entity`: String. Entity name.

**Returns:** WebORMEntity object or `undefined`.

### `weborm.page(entity, pageNumber, pageSize)`
Retrieves a page of records of an entity, ordered by id.
* `entity`: String. Entity name.
* `pageNumber`: Number. The number of the desired page.
* `pageSize`: Number. The desired size for the page.

**Returns:** [ WebORMEntity ].

### `weborm.filter(entity, filters)`
Retrieves all records of an entity that match the filter function.
* `entity`: String. Entity name.
* `filters`: Function. Function to filter the records.

**Returns:** [ WebORMEntity ].

### `weborm.delete(entity, id)`
Deletes a single record by its entity and id.
* `entity`: String. Entity name.
* `id`: Number. Record id.

### `weborm.addTo(addThis, toObj)`
Adds an object as a `to many` relationship of another object.
* `addThis`: WebORMEntity object. Object to be added as a `to many` relationship.
* `toObj`: WebORMEntity object. Object that will receive `addThis` as a `to many` relationship.

### `weborm.removeFrom(removeThis, fromObj)`
Removes an object as a `to many` relationship of another object.
* `removeThis`: WebORMEntity object. Object to be removed as a `to many` relationship.
* `fromObj`: WebORMEntity object. Object that will lose `removeThis` as a `to many` relationship.

### `weborm.relatedTo(related, toObj)`
Indicates whether an object is related to another as a `to many` relationship.
* `related`: WebORMEntity object. Object you want to know whether is related to `toObj`.
* `toObj`: WebORMEntity object. Object you want to know whether `related` is related to.

**Returns:** Boolean.

### `weborm.same(obj1, obj2)`
Indicates whether `obj1` and `obj2` refer to the same record of the same entity.
* `obj1`: WebORMEntity object.
* `obj2`: WebORMEntity object.

**Returns:** Boolean.

### `weborm.equals(obj1, obj2)`
Indicates whether `obj1` and `obj2` have the same values for all of its attributes, *not considering* the `id` attribute.
* `obj1`: WebORMEntity object.
* `obj2`: WebORMEntity object.

**Returns:** Boolean.


## WebORMEntity objects reference

### `webormEntity.save()`
Saves an object to the storage. Equivalent to `weborm.save(entity, webormEntity)`. Only makes sense for updates, because requires an already existing WebORMEntity object, which is returned by `weborm.save(...)` or by one of `weborm` retrieval methods.

### `webormEntity.delete()`
Deletes an object from the storage. Equivalent to `weborm.delete(entity, webormEntity.id)`. Only makes sense for an already existing WebORMEntity object, which is returned by `weborm.save(...)` or by one of `weborm` retrieval methods.
