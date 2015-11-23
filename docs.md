# ModelJS Docs

[Model-JS on GitHub](https://github.com/rafaeleyng/model-js)

## ModelJS constructor reference

### `ModelJS(schema, config)`
ModelJS constructor.
* `schema`: { }.
  * Keys are entity names and values are SchemaEntity objects.
* `config`: { }.
  * Valid keys and values:
    * `pluralization`: object where keys are entity names and values are how you want them pluralized, if they don't follow the pattern of just adding an 's' at the end of the word.

**Returns:** The ModelJS object.

### `ModelJS.SchemaEntity(attrs, relsToOne, relsToMany)`
SchemaEntity objects constructor.
* `attrs`: [ String ]. Attributes names for a given entity.
* `relsToOne`: [ String ]. Names of other SchemaEntity to which this entity will have a 'to one' relationship'.
* `relsToMany`: [ String ]. Names of other SchemaEntity to which this entity will have a 'to many' relationship'.

**Returns:** SchemaEntity object.


## ModelJS reference

### `modeljs.save(entity, data)`
Inserts a record, or update (replace) a record if `data` contains an id of a existing record.
* `entity`: String. Entity name.
* `data`: {} or ModelJSEntity object. Data to be stored. Only attributes that match the schema for that entity will be persisted.

**Returns:** ModelJSEntity object.

### `modeljs.find(entity, id)`
Retrieves a single record by its entity and id.
* `entity`: String. Entity name.
* `id`: Number. Record id.

**Returns:** ModelJSEntity object or `undefined`.

### `modeljs.all(entity)`
Retrieves all records of an entity.
* `entity`: String. Entity name.

**Returns:** [ ModelJSEntity ].

### `modeljs.count(entity)`
Counts the number of records of an entity.
* `entity`: String. Entity name.

**Returns:** Number.

### `modeljs.first(entity)`
Retrieves the first record of an entity, ordered by id.
* `entity`: String. Entity name.

**Returns:** ModelJSEntity object or `undefined`.

### `modeljs.last(entity)`
Retrieves the last record of an entity, ordered by id.
* `entity`: String. Entity name.

**Returns:** ModelJSEntity object or `undefined`.

### `modeljs.page(entity, pageNumber, pageSize)`
Retrieves a page of records of an entity, ordered by id.
* `entity`: String. Entity name.
* `pageNumber`: Number. The number of the desired page.
* `pageSize`: Number. The desired size for the page.

**Returns:** [ ModelJSEntity ].

### `modeljs.filter(entity, filters)`
Retrieves all records of an entity that match the filter function.
* `entity`: String. Entity name.
* `filters`: Function. Function to filter the records.

**Returns:** [ ModelJSEntity ].

### `modeljs.delete(entity, id)`
Deletes a single record by its entity and id.
* `entity`: String. Entity name.
* `id`: Number. Record id.

### `modeljs.addTo(addThis, toObj)`
Adds an object as a `to many` relationship of another object.
* `addThis`: ModelJSEntity object. Object to be added as a `to many` relationship.
* `toObj`: ModelJSEntity object. Object that will receive `addThis` as a `to many` relationship.

### `modeljs.removeFrom(removeThis, fromObj)`
Removes an object as a `to many` relationship of another object.
* `removeThis`: ModelJSEntity object. Object to be removed as a `to many` relationship.
* `fromObj`: ModelJSEntity object. Object that will lose `removeThis` as a `to many` relationship.

### `modeljs.relatedTo(related, toObj)`
Indicates whether an object is related to another as a `to many` relationship.
* `related`: ModelJSEntity object. Object you want to know whether is related to `toObj`.
* `toObj`: ModelJSEntity object. Object you want to know whether `related` is related to.

**Returns:** Boolean.

### `modeljs.same(obj1, obj2)`
Indicates whether `obj1` and `obj2` refer to the same record of the same entity.
* `obj1`: ModelJSEntity object.
* `obj2`: ModelJSEntity object.

**Returns:** Boolean.

### `modeljs.equals(obj1, obj2)`
Indicates whether `obj1` and `obj2` have the same values for all of its attributes, *not considering* the `id` attribute.
* `obj1`: ModelJSEntity object.
* `obj2`: ModelJSEntity object.

**Returns:** Boolean.


## ModelJSEntity objects reference

### `modeljsEntity.save()`
Saves an object to the storage. Equivalent to `modeljs.save(entity, modeljsEntity)`. Only makes sense for updates, because requires an already existing ModelJSEntity object, which is returned by `modeljs.save(...)` or by one of `modeljs` retrieval methods.

### `modeljsEntity.delete()`
Deletes an object from the storage. Equivalent to `modeljs.delete(entity, modeljsEntity.id)`. Only makes sense for an already existing ModelJSEntity object, which is returned by `modeljs.save(...)` or by one of `modeljs` retrieval methods.
