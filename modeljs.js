'use strict';

var ModelJS = function(schema, config) {

  ////////////////////////////////////////////////////////////////////////
  /*
    LocalStorage
  */
  var LocalStorage = {};
  LocalStorage._helpers = {};

  ////////////////////////////////////////////////////////////////////////
  // CRUD
  // read
  LocalStorage.count = function(entity) {
    return LocalStorage._getRoster(entity).length;
  }
  LocalStorage.find = function(entity, id) {
    var key = LocalStorage._helpers.genKey(entity, id);
    var stringData = localStorage.getItem(key);
    if (!stringData) {
      return undefined;
    }
    return JSON.parse(stringData);
  };
  LocalStorage.first = function(entity) {
    if (LocalStorage.count(entity) === 0) {
      return undefined;
    }
    var roster = LocalStorage._getRoster(entity);
    var firstId = roster[0];
    return LocalStorage.find(entity, firstId);
  };
  LocalStorage.all = function(entity) {
    var roster = LocalStorage._getRoster(entity);
    var objects = [];
    for (var i in roster) {
      var id = roster[i];
      objects.push(LocalStorage.find(entity, id));
    }
    return objects; 
  };
  LocalStorage.page = function(entity, pageNumber, pageSize) {
    var offset = pageSize * pageNumber;
    if (offset >= LocalStorage.count(entity)) {
      return [];
    }
    var roster = LocalStorage._getRoster(entity);
    var pageIds = roster.slice(offset, offset+pageSize);

    var objects = [];
    for (var i in pageIds) {
      var id = pageIds[i];
      objects.push(LocalStorage.find(entity, id));
    }
    return objects;
  };
  LocalStorage.filter = function(entity, filters) {
    return LocalStorage.all(entity).filter(filters);
  }

  // create / update
  LocalStorage.save = function(entity, object) {
    var objectId = object.id;
    var key = LocalStorage._helpers.genKey(entity, objectId);
    var isAdding = localStorage.getItem(key) === null;

    // add the id to entity roster, if is a new record
    if (isAdding) {
      var roster = LocalStorage._getRoster(entity);
      var location = LocalStorage._helpers.locationOf(objectId, roster);
      if (!location.found) {
        roster.splice(location.location, 0, objectId);      
        LocalStorage._saveRoster(entity, roster);
      } 
    }

    // add or replace the individual record
    localStorage.setItem(key, JSON.stringify(object));
  };

  // delete
  LocalStorage.delete = function(entity, id) {
    var key = LocalStorage._helpers.genKey(entity, id);
    
    var roster = LocalStorage._getRoster(entity);
    var location = LocalStorage._helpers.locationOf(id, roster);
    if (!location.found) {
      return false;
    }
    // remove id from roster
    roster.splice(location.location, 1);
    LocalStorage._saveRoster(entity, roster);

    // remove the individual record
    localStorage.removeItem(key);
    return true;
  };

  ////////////////////////////////////////////////////////////////////////
  // ROSTER - roster is an ordered array of all ids of an entity
  LocalStorage._getRoster = function(entity) {
    var rosterString = localStorage.getItem(entity);
    if (rosterString) {
      return JSON.parse(rosterString);
    } else {
      return [];
    }
  };
  LocalStorage._saveRoster = function(entity, roster) {
    localStorage.setItem(entity, JSON.stringify(roster));
  };
  LocalStorage.genId = function(entity) {
    var roster = LocalStorage._getRoster(entity);
    var lastId = roster[roster.length-1];
    if (lastId === undefined) {
      return 1;
    }
    return lastId + 1;
  };
  ////////////////////////////////////////////////////////////////////////
  // HELPERS
  LocalStorage._helpers.genKey = function(entity, id) {
    return entity + '_' + id;
  };
  // binary search - return the index where to insert (when adding) or the index to delete (when deleting)
  LocalStorage._helpers.locationOf = function(elt, array) {
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
  }

  ////////////////////////////////////////////////////////////////////////
  /*
    Storages
  */
  var storages = {
    localStorage: 'localStorage',
    webSQL: 'webSQL', // not supported yet
    indexedDB: 'indexedDB', // not supported yet
    defaultStorage: LocalStorage,

    storage: function(storage) {
      if (storage === this.localStorage) {
        return LocalStorage;
      }
      // TODO
      if (storage === this.webSQL) {
        return ''; 
      }
      // TODO
      if (storage === this.indexedDB) {
        return '';
      }
      return this.defaultStorage;
    }
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
    storage: storages.localStorage,
    pluralization: {},
  };
  // using user-defined configs
  for (var param in config) {
    if (this.config[param] !== undefined) {
      this.config[param] = config[param];
    }
  }

  this.storage = storages.storage(this.config.storage);

  ////////////////////////////////////////////////////////////////////////
  // CONSTRUCTORS
  // base constructor
  this.Entity[this.config.base] = function(data, entity) {
    for (var key in data) {
      this[key] = data[key];
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
        modelJSReference.Entity[modelJSReference.config.base].call(this, data, ent)};
    })(entity);
  }

  ////////////////////////////////////////////////////////////////////////
  // CONTEXT
  // holds ModelJS objects (not plain data objects)
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
    if (data === undefined) {
      data = {};
    }
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
    if (data.id === undefined) {
      data.id = this._genId(entity);
    }     
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
    return this.new(entity, this.storage.find(entity, id));
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
      for (var i in filteredData) {
        this._save(entity, filteredData[i], data[i]);
      }
    } else {
      this._save(entity, filteredData, data);
    }
  };
  
  this._save = function(entity, filteredData, data) {
    this.storage.save(entity, filteredData);
    var Constructor = this.Entity[entity];
    this._putInContext(entity, new Constructor(data));
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
  }
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
        if (entitySchema.indexOf(prop) > -1) {
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
