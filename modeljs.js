'use strict';

var ModelJS = function(schema, config) {

  var ID = 'id';

  ////////////////////////////////////////////////////////////////////////
  /*
    LocalStorage
  */
  var LocalStorage = function LocalStorage() {
    this.clean = function() {
      for (var key in localStorage) {
        localStorage.removeItem(key);
      }
    };
    ////////////////////////////////////////////////////////////////////////
    // CRUD
    // read
    this.count = function(entity) {
      return this._getIndex(entity).length;
    };
    this.find = function(entity, id) {
      var key = this._helpers.genKey(entity, id);
      var stringData = localStorage.getItem(key);
      if (!stringData) {
        return undefined;
      }
      return JSON.parse(stringData);
    };
    this.first = function(entity) {
      if (this.count(entity) === 0) {
        return undefined;
      }
      var index = this._getIndex(entity);
      var firstId = index[0];
      return this.find(entity, firstId);
    };
    this.all = function(entity) {
      var index = this._getIndex(entity);
      var objects = [];
      for (var i in index) {
        var id = index[i];
        objects.push(this.find(entity, id));
      }
      return objects; 
    };
    this.page = function(entity, pageNumber, pageSize) {
      var offset = pageSize * pageNumber;
      if (offset >= this.count(entity)) {
        return [];
      }
      var index = this._getIndex(entity);
      var pageIds = index.slice(offset, offset+pageSize);

      var objects = [];
      for (var i in pageIds) {
        var id = pageIds[i];
        objects.push(this.find(entity, id));
      }
      return objects;
    };
    this.filter = function(entity, filters) {
      return this.all(entity).filter(filters);
    };
    // create / update
    this.save = function(entity, object) {
      var objectId = object.id;
      var key = this._helpers.genKey(entity, objectId);
      var isAdding = localStorage.getItem(key) === null;

      // add the id to entity index, if is a new record
      if (isAdding) {
        var index = this._getIndex(entity);
        var location = this._helpers.locationOf(objectId, index);
        if (!location.found) {
          index.splice(location.location, 0, objectId);      
          this._saveIndex(entity, index);
        } 
      }

      // add or replace the individual record
      localStorage.setItem(key, JSON.stringify(object));
    };

    // delete
    this.delete = function(entity, id) {
      var key = this._helpers.genKey(entity, id);
      
      var index = this._getIndex(entity);
      var location = this._helpers.locationOf(id, index);
      if (!location.found) {
        return false;
      }
      // remove id from index
      index.splice(location.location, 1);
      this._saveIndex(entity, index);

      // remove the individual record
      localStorage.removeItem(key);
      return true;
    };

    ////////////////////////////////////////////////////////////////////////
    // Index - index is an ordered array of all ids of an entity
    this._getIndex = function(entity) {
      var indexString = localStorage.getItem(entity);
      if (indexString) {
        return JSON.parse(indexString);
      } else {
        return [];
      }
    };
    this._saveIndex = function(entity, index) {
      localStorage.setItem(entity, JSON.stringify(index));
    };
    this.genId = function(entity) {
      var index = this._getIndex(entity);
      var lastId = index[index.length-1];
      if (lastId === undefined) {
        return 1;
      }
      return lastId + 1;
    };
    ////////////////////////////////////////////////////////////////////////
    // HELPERS
    this._helpers = {};
    this._helpers.genKey = function(entity, id) {
      return entity + '_' + id;
    };
    // binary search - return the index where to insert (when adding) or the index to delete (when deleting)
    this._helpers.locationOf = function(elt, array) {
      var low = 0;
      var high = array.length-1;
      var mid = 0;
      var midElt = elt;
      var iterations = 0;
      while (low <= high) {
        iterations++;
        mid = (low + high) / 2 | 0;
        midElt = array[mid];
        if (elt == midElt) {
           return {found: true, location: mid};
        }
        if (elt > midElt) {
          low = mid + 1;
        }
        else {
          high = mid - 1;
        }
      }

      if (elt > midElt) {
        mid++;
      }
      return {found: false, location: mid};
    };   
  };

  ////////////////////////////////////////////////////////////////////////
  /*
    Get storages
  */
  var getStorage = function(storageName) {
    var defaultStorage = LocalStorage;
    if (storageName === 'localStorage') {
      return LocalStorage;
    }
    // TODO
    if (storageName === 'webSQL') {
      return undefined;
    }
    // TODO
    if (storageName === 'indexedDB') {
      return undefined;
    }
    return defaultStorage;
  }

  ////////////////////////////////////////////////////////////////////////
  /*
    ModelJS
  */
  var modelJSReference = this;
  this.schema = schema;
  this.Entity = {};

  ////////////////////////////////////////////////////////////////////////
  // CONFIG
  // default config
  // every accepted configuration must be different that undefined inside this.config
  this.config = {
    base: '_Base',
    storage: 'localStorage',
    pluralization: {},
  };
  // using user-defined configs
  for (var param in config) {
    if (this.config[param] !== undefined) {
      this.config[param] = config[param];
    }
  }
  var storageConstructor = getStorage(this.config.storage);
  this.storage = new storageConstructor();

  ////////////////////////////////////////////////////////////////////////
  // CONSTRUCTORS
  // base constructor
  this.Entity[this.config.base] = function(data, entity) {
    for (var key in data) {
      if (key === 'id') {
        Object.defineProperty(this, 'id', {value: data[key], writable: false, enumerable: true});
      } else {
        this[key] = data[key];
      }
    }
    if (entity) {
      this.class = entity;
    };
  }

  // create a constructor for each entity
  for (var entity in this.schema) {
    if (entity === this.config.base) { 
      continue;
    }
    (function(ent) {
      modelJSReference.Entity[ent] =  function(data) { 
        modelJSReference.Entity[modelJSReference.config.base].call(this, data, ent)
      };
    })(entity);
  }

  ////////////////////////////////////////////////////////////////////////
  // CONTEXT
  // holds ModelJS objects (not plain JS objects)
  this.context = {};

  this._getFromContext = function(entity, data) {
    return this.context[this._genKey(entity, data.id)];
  };
  this._putInContext = function(entity, object) {
    this.context[this._genKey(entity, object.id)] = object;
    return object;
  };
  this._contextContains = function(entity, data) {
    return this.context[entity + '_' + data.id] !== undefined;
  };
  // returns one or an array of ModelJS objects with the correct entity type
  this.new = function(entity, data) {
    data = data || {};
    if (this._isCollection(data)) {
      var objects = [];
      for (var i in data) {     
        objects.push(this._new(entity, data[i]));       
      }
      return objects;
    } else {
      return this._new(entity, data);
    }
  };

  this._new = function(entity, data) {
    if (this._contextContains(entity, data)) {
      return this._getFromContext(entity, data);
    }
    var Constructor = this.Entity[entity];
    return this._putInContext(entity, new Constructor(data));   
  };

  ////////////////////////////////////////////////////////////////////////
  // CRUD
  // read
  this.count = function(entity) {
    return this.storage.count(entity);
  };
  this.find = function(entity, id) {
    var data = this.storage.find(entity, id);
    if (!data) {
      return undefined;
    }
    return this.new(entity, data);
  };
  this.first = function(entity) {
    return this.new(entity, this.storage.first(entity));
  };
  this.all = function(entity) {
    return this.new(entity, this.storage.all(entity));
  };
  this.page = function(entity, pageNumber, pageSize) {
    return this.new(entity, this.storage.page(entity, pageNumber, pageSize));
  };
  this.filter = function(entity, filterFunction) {
    if (!filterFunction) {
      return this.all(entity);
    };
    return this.new(entity, this.storage.filter(entity, filterFunction));
  };

  // insert / update
  this.save = function(entity, data) {
    // skip if entity is not in schema
    if (this.schema[entity] === undefined) {
      return;
    }

    var filteredData = this._filterData(entity, data);    
    if (this._isCollection(filteredData)) {
      var savedObjects = [];
      for (var i in filteredData) {
        if (!filteredData[i].id) {
          filteredData[i].id = this._genId(entity);
        }
        savedObjects.push(this._save(entity, filteredData[i]));
      }
      return savedObjects;
    } else {
      if (!filteredData.id) {
        filteredData.id = this._genId(entity);
      }
      return this._save(entity, filteredData);
    }
  };
  
  this._save = function(entity, filteredData) {
    this.storage.save(entity, filteredData);
    var Constructor = this.Entity[entity];
    var record = new Constructor(filteredData);
    this._putInContext(entity, record);
    return record;
  };
  
  // delete
  this.delete = function(entity, id) {
    delete this.context[this._genKey(entity, id)];
    this.storage.delete(entity, id);
  };

  ////////////////////////////////////////////////////////////////////////
  // TO MANY
  this.addTo = function(addThis, toObj) {
    var property = this._pluralize(addThis.class);
    var newRelationObjs = this._makeCollection(addThis);
    var oldRelationIds = toObj[this._lcFirst(property) + 'Id'];
    var filteredObjs = [];
    // won't allow duplicates
    for (var i in newRelationObjs) {
      var newRelationObj = newRelationObjs[i];
      if (oldRelationIds.indexOf(newRelationObj.id) === -1) {
        filteredObjs.push(newRelationObj);
      }
    }   
    // this also updates the relationship ids
    toObj[property] = toObj[property].concat(filteredObjs);   
  };

  this.removeFrom = function(removeThis, fromObj) {
    var property = this._pluralize(removeThis.class);
    var oldRelationObjs = fromObj[property];
    for (var i in oldRelationObjs) {
      var oldRelationObj = oldRelationObjs[i];
      if (this.same(removeThis, oldRelationObj)) {
        oldRelationObjs.splice(i,1);
        break;
      }
    }
    // this also updates the relationship ids
    fromObj[property] = oldRelationObjs;
  }

  this.relatedTo = function(related, toObj) {
    var property = this._pluralize(related.class);
    var relationObjs = toObj[property];
    for (var i in relationObjs) {
      var relationObj = relationObjs[i];
      if (this.same(related, relationObj)) {
        return true;
      }
    }
    return false;
  };

  ////////////////////////////////////////////////////////////////////////
  // OTHERS
  this.same = function(obj1, obj2) {
    return obj1.class === obj2.class && obj1.id === obj2.id;
  };
  this.equals = function(obj1, obj2) {
    // TODO implementar iterando sobre os attributos previstos no schema
  };

  ////////////////////////////////////////////////////////////////////////
  // HELPERS
  this._pluralize = function(entity) {
    return this.config.pluralization[entity] || entity + 's'
  };
  this._typeOf = function(value) {
    return Object.prototype.toString.call(value).slice(8,-1);
  };
  this._isCollection = function(value) {
    return this._typeOf(value) === 'Array';
  };
  this._makeCollection = function(value) {
    if (this._isCollection(value)) {
      return value;
    }
    return [value];
  };
  this._lcFirst = function(str) {
    return str.substr(0,1).toLowerCase() + str.substr(1, str.length);
  };
  this._genKey = function(entity, id) {
    return entity + '_' + id;
  };
  this._genId = function(entity) {
    return this.storage.genId(entity);
  };
  this._filterData = function(entity, dirtyData) {
    var entitySchema = this.schema[this.config.base].attrs.concat(this.schema[entity].attrs);

    if (this._isCollection(dirtyData)) {
      var filteredObjects = [];
      for (var i in dirtyData) {
        var dirtyObject = dirtyData[i];
        var filteredObject = {};
        for (var prop in dirtyObject) {
          if (entitySchema.indexOf(prop) > -1) {
            filteredObject[prop] = dirtyObject[prop];
          }
        }
        filteredObjects.push(filteredObject);
      }
      return filteredObjects;
    } else {
      var filteredObject = {};
      for (var prop in dirtyData) {
        if (entitySchema.indexOf(prop) !== -1) {
          filteredObject[prop] = dirtyData[prop];
        }
      }
      return filteredObject;
    }
  }

  // the prototype for each entity constructor and for each entity object
  var basePrototype = {
    // parameters are capitalized to better represent the capitalization of the strings they represent
    directRelToOne: function(Property) {
      // Property: Country - the relationship object accessor

      var _Property = '_' + Property; // _Country - the variable that holds the relationship object
      var property = modelJSReference._lcFirst(Property); // country
      var propertyId = property + 'Id'; // countryId - the relationship id accessor
      var _propertyId = '_' + propertyId; // _countryId - the variable that holds the relationship id

      // accessors for relationship object
      Object.defineProperty(this, Property, {
        get: function() {
          if (!this[_Property]) {
            this[_Property] = modelJSReference.find(Property, this[_propertyId]);
          }
          return this[_Property];
        },
        set: function(newObj) {           
          this[_propertyId] = newObj.id;
          this[_Property] = newObj;
        },
      });

      // accessors for relationship id
      Object.defineProperty(this, propertyId, {
        get: function() {
          return this[_propertyId];
        },
        set: function(newId) {
          this[_propertyId] = newId;        
          this[_Property] = undefined; // let it be lazy-loaded when accessed again
        }
      });
    },

    // parameters are capitalized to better represent the capitalization of the strings they represent
    directRelToMany: function(Entity, Pluralized) {   
      // pluralized: Quadrants - the relationship object accessor

      var _Pluralized = '_' + Pluralized; // _Quadrants - the variable that holds the relationship objects
      var pluralized = modelJSReference._lcFirst(Pluralized); // quadrants
      var pluralizedId = pluralized + 'Id'; // quadrants - the relationships id accessor
      var _pluralizedId = '_' + pluralizedId; // _quadrantsId - the variable that holds the relationships id

      // accessors for relationship objects
      Object.defineProperty(this, Pluralized, {
        get: function() {
          if (!this[_Pluralized]) {
            var self = this;
            this[_Pluralized] = modelJSReference.filter(Entity, 
              function(obj) { 
                if (self[_pluralizedId] === undefined) {
                  return false;
                }
                return self[_pluralizedId].indexOf(obj.id) > -1 });
            this[_Pluralized] = this[_Pluralized] || [];
          }
          return this[_Pluralized] || [];
        },
        set: function(newObjs) {            
          this[_pluralizedId] = modelJSReference._makeCollection(newObjs).map(function(obj) { return obj.id; });
          this[_Pluralized] = modelJSReference._makeCollection(newObjs);
        },
      });

      // accessors for relationship ids
      Object.defineProperty(this, pluralizedId, {
        get: function() {
          return this[_pluralizedId] || [];
        },
        set: function(newIds) {
          this[_pluralizedId] = newIds;       
          this[_Pluralized] = undefined; // let it be lazy-loaded when accessed again
        }
      });
    },

    inverseRel: function(entity, inverse, inverseName) {
      // entity: State
      // inverse: City
      // inverseName: Cities

      var _inverseName = '_' + inverseName; // _Cities
      var entityId = '_' + modelJSReference._lcFirst(entity) + 'Id'; // _stateId

      // accessors for inverse relationship objects (an array)
      Object.defineProperty(this, inverseName, {
        get: function() {
          if (!this[_inverseName]) {
            var thisId = this.id;
            this[_inverseName] = modelJSReference.filter(inverse, 
              function(obj) { return obj[entityId] === thisId; }); }
          return this[_inverseName];
        },
      });
    },

    // convenience methods
    save: function() {
      modelJSReference.save(this.class, this);
    },
    delete: function() {
      modelJSReference.delete(this.class, this.id);
    },

  };

  ////////////////////////////////////////////////////////////////////////
  // RELATIONSHIPS
  for (var entity in this.Entity) {

    var entityPrototype = Object.create(basePrototype);

    // TODO melhorar esse comentário e o do próximo FOR, e esclarecer melhor o que é 'to one' e 'to many' aqui
    // create the direct relationships 'to one' (e.g. state.Country)
    var relsToOne = this.schema[entity].relsToOne;
    for (var i in relsToOne) {
      var relationship = relsToOne[i];
      // augment the schema by adding the fields that will hold the relationship ids (_countryId)
      this.schema[entity].attrs.push('_' + this._lcFirst(relationship) + 'Id');
      entityPrototype.directRelToOne(relationship); 
    }

    // create the direct relationships 'to many' (e.g. customer.Quadrants)
    var relsToMany = this.schema[entity].relsToMany;
    for (var i in relsToMany) {
      var relationship = relsToMany[i];
      // augment the schema by adding the fields that will hold the relationship ids (_quadrantsId)
      var pluralized = this._pluralize(relationship);     
      this.schema[entity].attrs.push('_' + this._lcFirst(pluralized) + 'Id');
      entityPrototype.directRelToMany(relationship, pluralized);  
    }   

    // create the inverse relationships
    for (var entity2 in this.Entity) {
      if (entity2 === entity) {
        continue; // haven't thought about self-relation yet
      }
      var relationships2 = this.schema[entity2].relsToOne;
      // if 'entity2' has 'entity' as a relationship, create the 'entity2' in 'entity'
      if (relationships2 && relationships2.indexOf(entity) > -1) {
        var inverse = this._pluralize(entity2);
        entityPrototype.inverseRel(entity, entity2, inverse);
      };
    }

    // each entity has his own prototype (entityPrototype), whose prototype is basePrototype
    var Constructor = this.Entity[entity];
    Constructor.prototype = entityPrototype;
  }

};
