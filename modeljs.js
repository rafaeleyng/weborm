'use strict';

var ModelJS = function(schema, config) {

  var self = this;
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
    this.last = function(entity) {
      var count = this.count(entity);
      if (count === 0) {
        return undefined;
      }
      var index = this._getIndex(entity);
      var lastId = index[count - 1];
      return this.find(entity, lastId);
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
        localStorage.setItem(this._idKey(entity), objectId);
      }

      // add or replace the individual record
      localStorage.setItem(key, JSON.stringify(object));
      return isAdding;
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
    this._idKey = function(entity) {
      return entity + self._ucFirst(ID);
    };
    this.genId = function(entity) {
      var lastId = localStorage.getItem(this._idKey(entity));
      if (!lastId) {
        return 1;
      }
      return parseInt(lastId) + 1;
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
  
  ////////////////////////////////////////////////////////////////////////
  // CONFIG
  // default config
  // every accepted configuration must be different that undefined inside this.config
  this.config = {
    storage: 'localStorage',
    pluralization: {}
  };
  // using user-defined configs
  for (var param in config) {
    if (this.config[param] !== undefined) {
      this.config[param] = config[param];
    }
  }
  // non-configurable defaults
  this.config.base = '_Base';
  this.config.defaultBase = '_DefaultBase';
  schema[this.config.defaultBase] = new ModelJS.SchemaEntity([ID]);

  var storageConstructor = getStorage(this.config.storage);
  this.storage = new storageConstructor();

  ////////////////////////////////////////////////////////////////////////
  // CONSTRUCTORS
  // base constructor
  this.schema = schema;
  this.Entity = {}; // holds a constructor for each entity in the schema
  this.Entity[this.config.defaultBase] = function(data, entity) {
    for (var key in data) {
      if (key === ID) {
        Object.defineProperty(this, ID, {value: data[key], writable: false, enumerable: true});
      } else {
        this[key] = data[key];
      }
    }
    if (entity) {
      this.class = entity;
    }
  }

  // create a constructor for each entity
  for (var entity in this.schema) {
    if (entity === this.config.defaultBase) { 
      continue; // won't allow to override the defaultBase entity, which provides the id for each record
    }
    if (!this.schema[entity].attrs) {
      this.schema[entity].attrs = [];
    }
    (function(ent) {
      self.Entity[ent] = function(data) { 
        self.Entity[self.config.defaultBase].call(this, data, ent)
      };
    })(entity);
  }
  this._attrsForEntity = function(entity) {
    var defaultBaseAttrs = this.schema[this.config.defaultBase].attrs;    
    var customBaseAttrs = this.schema[this.config.base] ? this.schema[this.config.base].attrs : [];
    var entityAttrs = this.schema[entity].attrs;
    return defaultBaseAttrs.concat(customBaseAttrs).concat(entityAttrs);
  };
  ////////////////////////////////////////////////////////////////////////
  // CONTEXT
  // holds ModelJSEntity objects (not plain JS objects)
  this.context = {};

  this._getFromContext = function(entity, data) {
    return this.context[this._genKey(entity, data.id)];
  };
  this._putInContext = function(entity, object) {
    var contextKey = this._genKey(entity, object.id);
    if (this._contextContains(entity, object)) {
      var attrsForEntity = this._attrsForEntity(entity);
      for (var i in attrsForEntity) {
        var attr = attrsForEntity[i];
        if (attr === ID) {
          continue;
        }
        this.context[contextKey][attr] = object[attr];
      }
    } else {
      this.context[contextKey] = object;
    }
    return object;
  };
  this._contextContains = function(entity, data) {
    return this.context[entity + '_' + data.id] !== undefined;
  };
  // returns one or an array of ModelJSEntity objects with the correct entity type
  this._create = function(entity, data) {
    data = data || {};
    if (this._isCollection(data)) {
      var objects = [];
      for (var i in data) {     
        objects.push(this._createOrGetFromContex(entity, data[i]));       
      }
      return objects;
    } else {
      return this._createOrGetFromContex(entity, data);
    }
  };

  this._createOrGetFromContex = function(entity, data) {
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
    debugger
    var data = this.storage.find(entity, id);
    if (!data) {
      return undefined;
    }
    return this._create(entity, data);
  };
  this.first = function(entity) {
    return this._create(entity, this.storage.first(entity));
  };
  this.last = function(entity) {
    return this._create(entity, this.storage.last(entity));
  };
  this.all = function(entity) {
    return this._create(entity, this.storage.all(entity));
  };
  this.page = function(entity, pageNumber, pageSize) {
    return this._create(entity, this.storage.page(entity, pageNumber, pageSize));
  };
  this.filter = function(entity, filterFunction) {
    if (!filterFunction) {
      return this.all(entity);
    };
    return this._create(entity, this.storage.filter(entity, filterFunction));
  };

  this.exists = function(entity, id) {
    return this.find(entity, id) !== undefined;
  };

  // insert / update
  this.save = function(entity, data) {
    debugger
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
        } else {
          if (!this.exists(entity, filteredData[i].id)) {
            filteredData[i].id = this._genId(entity);            
          }
        }
        savedObjects.push(this._save(entity, filteredData[i]));
      }
      return savedObjects;
    } else {
      if (!filteredData.id) {
        filteredData.id = this._genId(entity);
      } else {
        if (!this.exists(entity, filteredData.id)) {
          filteredData.id = this._genId(entity);            
        }
      }
      debugger
      return this._save(entity, filteredData);
    }
  };
  
  this._save = function(entity, filteredData) {
    var isAdding = this.storage.save(entity, filteredData);
    var Constructor = this.Entity[entity];
    var record = new Constructor(filteredData);
    this._putInContext(entity, record);
    
    // insert the new object in the inverse relationship arrays
    if (isAdding) {
      var inverseRelName = this._pluralize(entity);
      for (var i in this.context) {
        var ctxObj = this.context[i];
        var inverseRelObjs = ctxObj[inverseRelName];
        if (inverseRelObjs) {
          if (ctxObj.id === record[this._lcFirst(ctxObj.class) + self._ucFirst(ID)]) {
            var alreadyInTheInverse = false;
            for (var j in inverseRelObjs) {
              if (inverseRelObjs[j].id === record.id) {
                alreadyInTheInverse = true;
                break;
              }
            }
            if (!alreadyInTheInverse) {
              inverseRelObjs.push(record);
            }
          }
        }
      }
    }

    return record;
  };
  
  // delete
  this.delete = function(entity, id) {
    delete this.context[this._genKey(entity, id)];
    // delete the deleted object in the inverse relationship arrays
    var inverseRelName = this._pluralize(entity);
    for (var i  in this.context) {
      var ctxObj = this.context[i];
      var inverseRelObjs = ctxObj[inverseRelName];
      if (inverseRelObjs) {
        for (var j in inverseRelObjs) {
          var inverseRelObj = inverseRelObjs[j];
          if (inverseRelObj.id === id) {
            var index = parseInt(j);
            inverseRelObjs.splice(index,1);
            break;
          }
        }
      }
    }
    this.storage.delete(entity, id);
  };

  ////////////////////////////////////////////////////////////////////////
  // TO MANY
  this.addTo = function(addThis, toObj) {
    var property = this._pluralize(addThis.class);
    var newRelationObjs = this._makeCollection(addThis);
    var oldRelationIds = toObj[this._lcFirst(property) + self._ucFirst(ID)];
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
  // whether two objects have the same values for properties, not considering the id
  this.equals = function(obj1, obj2) {
    if (!obj1.class || obj1.class !== obj2.class) {
      return false;
    }
    var entity = obj1.class
    var attrs = this._attrsForEntity(entity);
    for (var i in attrs) {
      var attr = attrs[i];
      if (attr === ID) {
        continue;
      }
      if (obj1[attr] !== obj2[attr]) {
        return false;
      }
    }
    return true;
  };

  ////////////////////////////////////////////////////////////////////////
  // HELPERS
  this._pluralize = function(entity) {
    return this.config.pluralization[entity] || entity + 's';
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
  this._ucFirst = function(str) {
    return str.substr(0,1).toUpperCase() + str.substr(1, str.length);
  };
  this._genKey = function(entity, id) {
    return entity + '_' + id;
  };
  this._genId = function(entity) {
    return this.storage.genId(entity);
  };
  this._filterData = function(entity, dirtyData) {
    var entitySchema = this._attrsForEntity(entity);

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
      var property = self._lcFirst(Property); // country
      var propertyId = property + self._ucFirst(ID); // countryId - the relationship id accessor
      var _propertyId = '_' + propertyId; // _countryId - the variable that holds the relationship id

      // accessors for relationship object
      Object.defineProperty(this, Property, {
        get: function() {
          if (!this[_Property]) {
            this[_Property] = self.find(Property, this[_propertyId]);
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
      // pluralized: Services - the relationship object accessor

      var _Pluralized = '_' + Pluralized; // _Services - the variable that holds the relationship objects
      var pluralized = self._lcFirst(Pluralized); // services
      var pluralizedId = pluralized + self._ucFirst(ID); // servicesId - the relationships id accessor
      var _pluralizedId = '_' + pluralizedId; // _servicesId - the variable that holds the relationships id

      // accessors for relationship objects
      Object.defineProperty(this, Pluralized, {
        get: function() {
          if (!this[_Pluralized]) {
            var _this = this;
            this[_Pluralized] = self.filter(Entity, 
              function(obj) { 
                if (_this[_pluralizedId] === undefined) {
                  return false;
                }
                return _this[_pluralizedId].indexOf(obj.id) > -1 });
            this[_Pluralized] = this[_Pluralized] || [];
          }
          return this[_Pluralized] || [];
        },
        set: function(newObjs) {            
          this[_pluralizedId] = self._makeCollection(newObjs).map(function(obj) { return obj.id; });
          this[_Pluralized] = self._makeCollection(newObjs);
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
      var entityId = '_' + self._lcFirst(entity) + self._ucFirst(ID); // _stateId

      // accessors for inverse relationship objects (an array)
      Object.defineProperty(this, inverseName, {
        get: function() {
          if (!this[_inverseName]) {
            var thisId = this.id;
            this[_inverseName] = self.filter(inverse, 
              function(obj) { return obj[entityId] === thisId; }); }
          return this[_inverseName];
        },
      });
    },

    // convenience methods
    save: function() {
      self.save(this.class, this);
    },
    delete: function() {
      self.delete(this.class, this.id);
    },

  };

  ////////////////////////////////////////////////////////////////////////
  // RELATIONSHIPS
  for (var entity in this.Entity) {

    var entityPrototype = Object.create(basePrototype);

    // create the direct relationships 'to one' (e.g. state.Country)
    var relsToOne = this.schema[entity].relsToOne;
    for (var i in relsToOne) {
      var relationship = relsToOne[i];
      // augment the schema by adding the fields that will hold the relationship ids (_countryId)
      this.schema[entity].attrs.push('_' + this._lcFirst(relationship) + self._ucFirst(ID));
      entityPrototype.directRelToOne(relationship); 
    }

    // create the direct relationships 'to many' (e.g. city.Services)
    var relsToMany = this.schema[entity].relsToMany;
    for (var i in relsToMany) {
      var relationship = relsToMany[i];
      // augment the schema by adding the fields that will hold the relationship ids (_servicesId)
      var pluralized = this._pluralize(relationship);     
      this.schema[entity].attrs.push('_' + this._lcFirst(pluralized) + self._ucFirst(ID));
      entityPrototype.directRelToMany(relationship, pluralized);  
    }   

    // create the inverse relationships
    for (var entity2 in this.Entity) {
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

ModelJS.SchemaEntity = function(attrs, relsToOne, relsToMany) {
  this.attrs = attrs || [];
  this.relsToOne = relsToOne || [];
  this.relsToMany = relsToMany || [];
};
