describe('ModelJS', function() {

  var modelJS;
  var storage;
  var schema = {
    _Base: new ModelJS.SchemaEntity(['name']),
    Country: new ModelJS.SchemaEntity(['abbr']),
    State: new ModelJS.SchemaEntity(['abbr'], ['Country']),
    City: new ModelJS.SchemaEntity([], ['State'])
  };
  
  var config = {
    pluralization: {
      Country: 'Countries',
      City: 'Cities'
    }
  };

  var ENTITY = 'Country';
  var ID = 1;

  beforeEach(function() {
    modelJS = new ModelJS(schema, config);
    modelJS.storage.clean();
  });

  afterAll(function() {
    modelJS.storage.clean();
  });

  it('should be defined', function() {
    expect(modelJS).toBeDefined();
  });

  it('should create new object', function() {
    var country = modelJS.save('Country', {name: 'country'});
    expect(country).toBeDefined();
  });

  it('should generate an id to a new object', function() {
    var country = modelJS.save('Country', {name: 'country'});
    expect(country.id).toBeDefined();
  });

  it('should save to/read from client storage', function() {
    var savedObject = modelJS.save('Country', { name: 'country'});
    expect(modelJS.find('Country', savedObject.id)).toBeDefined();
  });

  it('should not find object with invalid id', function() {
    var invalidId = -1;
    expect(modelJS.find('Country', invalidId)).toBeUndefined();    
  });

  it('shouldn\'t allow to change the id', function() {
    var country = modelJS.save('Country', {name: 'country'});
    var id = country.id;
    expect(id).toBeDefined();
    country.id = -1;
    expect(country.id).toEqual(id);
  });

  it('should filter properties not in the schema', function() {
    var country = modelJS.save('Country', {name: 'country', propNotInSchema: 'any value'});
    expect(country.propNotInSchema).toBeUndefined();
  });

  it('entities should inherit properties from the base entity', function() {
    var name = 'country';
    var country = modelJS.save('Country', {name: name, propNotInSchema: 'any value'});
    expect(country.name).toBeDefined();
    expect(country.propNotInSchema).toBeUndefined();
  });

  it('should tell whether two ModelJS objects reffer to the same record', function() {
    var country1 = modelJS.save('Country', {name: 'Brazil'});
    var country1Found = modelJS.find('Country', country1.id);
    var country2 = modelJS.save('Country', {name: 'Peru'});
    var country2Found = modelJS.find('Country', country2.id);
    var state1 = modelJS.save('State', {name: 'Rio Grande do Sul'});

    expect(modelJS.same(country1, country1Found)).toBeTruthy();
    expect(modelJS.same(country2, country2Found)).toBeTruthy();

    expect(modelJS.same(country1, country2)).toBeFalsy();
    expect(modelJS.same(country1, state1)).toBeFalsy();
  });

  it('should keep objects in context and return always the same instance for a record', function() {
    var country1 = modelJS.save('Country', {name: 'Brazil'});
    var country1Found = modelJS.find('Country', country1.id);
    expect(country1).toEqual(country1Found);
    
    var state1 = modelJS.save('State', {name: 'Rio Grande do Sul'});
    state1.Country = country1;
    state1.save();
    var state1Found = modelJS.find('State', state1.id);
    expect(country1).toEqual(state1Found.Country);
  });

  it('should tell whether two ModelJS objects are equal', function() {
    var brazil = modelJS.save('Country', {name: 'Brazil', abbr: 'BR'});
    var brazil2 = modelJS.save('Country', {name: 'Brazil', abbr: 'BRA'});
    var brasil = modelJS.save('Country', {name: 'Brasil', abbr: 'BR'});
    var sc = modelJS.save('State', {name: 'Santa Catarina'});

    expect(modelJS.equals(brazil, brazil)).toBeTruthy();
    expect(modelJS.equals(brazil, brasil)).toBeFalsy();
    expect(modelJS.equals(brazil, brazil2)).toBeFalsy();
    expect(modelJS.equals(brazil, sc)).toBeFalsy();
    // TODO test relationships?
    // TODO does this 'equals' method really have a point for existing?
  });

  it('should find objects previously saved', function() {
    modelJS.save(ENTITY, {id: ID});
    expect(modelJS.find(ENTITY, ID)).toBeDefined();
  });

  it('should find the first object of a given entity', function() {
    modelJS.save(ENTITY, {id: ID});
    modelJS.save(ENTITY, {id: ID+1});
    modelJS.save(ENTITY, {id: ID+2});
    expect(modelJS.first(ENTITY).id).toEqual(ID);
  });

  it('should find the last object of a given entity', function() {
    modelJS.save(ENTITY, {id: ID});
    modelJS.save(ENTITY, {id: ID+1});
    modelJS.save(ENTITY, {id: ID+2});
    expect(modelJS.last(ENTITY).id).toEqual(ID+2);
  });

  it('should count records of a given entity', function() {    
    var aNumberOfRecords = 6;
    for (var i = 0; i < aNumberOfRecords; i++) {
      modelJS.save(ENTITY, {id: i+1});
    }
    expect(modelJS.count(ENTITY)).toEqual(aNumberOfRecords);
    expect(modelJS.count(ENTITY)).toEqual(modelJS.all(ENTITY).length);    
  });

  it('should retrieve all records of a given entity', function() {    
    var aNumberOfRecords = 10;
    for (var i = 0; i < aNumberOfRecords; i++) {
      modelJS.save(ENTITY, {id: i+1});
    }
    expect(modelJS.all(ENTITY).length).toEqual(aNumberOfRecords);
  });

  it('should retrieve any page of the records of a given entity', function() {    
    var pageSize = 5;
    var numberOfPages = 3;
    var someNumberSmallerThanPageSize = pageSize - 1
    var aNumberOfRecords = (pageSize * numberOfPages) - someNumberSmallerThanPageSize;

    for (var i = 0; i < aNumberOfRecords; i++) {
      modelJS.save(ENTITY, {id: i+1});
    }

    for (var pageNumber = 0; pageNumber < numberOfPages; pageNumber++) {
      if (pageNumber === numberOfPages - 1) {
        expect(modelJS.page(ENTITY, pageNumber, pageSize).length).toEqual(pageSize - someNumberSmallerThanPageSize);
      } else {
        expect(modelJS.page(ENTITY, pageNumber, pageSize).length).toEqual(pageSize);
      }
    }
  });

  it('should filter the records of a given entity by any property', function() {
    modelJS.save(ENTITY, {name: 'Brazil', abbr: 'BR'});
    modelJS.save(ENTITY, {name: 'Brazil', abbr: 'BRA'});
    modelJS.save(ENTITY, {name: 'Peru', abbr: 'PE'});
    expect(modelJS.count(ENTITY)).toEqual(3);
    expect(modelJS.filter(ENTITY, function(data) { return data.name === 'Brazil'}).length).toEqual(2);
    expect(modelJS.filter(ENTITY, function(data) { return data.name === 'Brazil' && data.abbr === 'BR'}).length).toEqual(1);
    expect(modelJS.filter(ENTITY, function(data) { return data.name === 'Peru'}).length).toEqual(1);
  });

  it('should be able to delete records', function() {
    modelJS.save(ENTITY);
    expect(modelJS.count(ENTITY)).toEqual(1);
    modelJS.save(ENTITY);
    expect(modelJS.count(ENTITY)).toEqual(2);
    
    modelJS.delete(ENTITY, ID);
    expect(modelJS.count(ENTITY)).toEqual(1);
    modelJS.delete(ENTITY, ID+1);
    expect(modelJS.count(ENTITY)).toEqual(0);
  });

  it('should save a bunch of objects', function() {
    var data = [
      {name: 'Brazil'},
      {name: 'Uruguay'},
      {name: 'Argentina'},
      {name: 'Chile'}
    ];
    var dataLength = data.length;
    var countries = modelJS.save('Country', data);

    expect(countries.length).toEqual(dataLength);
    expect(modelJS.count('Country')).toEqual(dataLength);
    expect(modelJS.all('Country').length).toEqual(dataLength);
  });

  it('should delete object when delete function is called on the object itself', function() {
    var obj = modelJS.save(ENTITY, {name: 'Brazil'});
    expect(modelJS.count(ENTITY)).toEqual(1);
    obj.delete();
    expect(modelJS.count(ENTITY)).toEqual(0);
  });

  it('should maintain a sequential id for each entity', function() {
    var aNumberOfRecords = 5;
    for (var i = 0; i < aNumberOfRecords; i++) {
      modelJS.save(ENTITY, {name: 'country'});
    }

    var count = modelJS.count(ENTITY);
    expect(count).toEqual(aNumberOfRecords);

    var all = modelJS.all(ENTITY);
    var lastId = all[count - 1].id;

    for (var i in all) {
      all[i].delete();
    }
    expect(modelJS.count(ENTITY)).toEqual(0);
    
    var lastSaved = modelJS.save(ENTITY, {name: 'country'});
    expect(lastSaved.id).toEqual(lastId + 1);
  });

  it('should tell wheter a record exists', function(){
    var br = modelJS.save('Country', {name: 'Brazil'});
    var es = modelJS.save('State', {name: 'Espírito Santo'});

    expect(modelJS.exists('Country', br.id)).toBeTruthy();
    expect(modelJS.exists('State', es.id)).toBeTruthy();

    expect(modelJS.exists('Country', 2)).toBeFalsy();
    expect(modelJS.exists('State', 3)).toBeFalsy();
  });

  it('shouldn\'t allow to set the id when creating a record', function() {
    modelJS.save('City', {name:'Paris', id: 2});
    modelJS.save('City', {name:'Nice', id: 4});
    
    var cities = modelJS.all('City');
    expect(cities[0].id).toEqual(1);
    expect(cities[1].id).toEqual(2);
  });

  it('should allow to set the id when updating a record', function() {    
    var santiago = modelJS.save('City', {name:'Santiago', id: 2});
    var vina = modelJS.save('City', {name:'Viña', id: 4});
    
    expect(modelJS.count('City')).toEqual(2);
    expect(vina.id).toEqual(2);
    
    var newName = 'Viña del Mar';
    modelJS.save('City', {name: newName, id: vina.id});
    expect(modelJS.count('City')).toEqual(2);
    expect(modelJS.find('City', 2).name).toEqual(newName);
  });

  it('should retain all attributes after setting an relationship', function() {
    var country1 = modelJS.save('Country', {name:'Brazil'});
    var state1 = modelJS.save('State', {name:'Rio Grande do Sul', abbr:'RS'});

    state1.Country = country1;
    state1.save();

    var state1Found = modelJS.find('State', state1.id);
    expect(state1).toEqual(state1Found);
    expect(state1.name).toEqual(state1Found.name);
    expect(state1.abbr).toEqual(state1Found.abbr);
  });

  it('should keep objects in context consistent after modifying their attributes and relationships', function() {
    var br = modelJS.save('Country', {name:'Brasil'});
    var para = modelJS.save('State', {name:'Para'});
    para.Country = br;
    para.save();
    var paraFound = modelJS.find('State', para.id);

    var newStateName = 'Pará';
    paraFound.name = newStateName;

    expect(para).toEqual(paraFound);
    expect(para.name).toEqual(paraFound.name);
    expect(para.abbr).toEqual(paraFound.abbr);
    expect(para.name).toEqual(newStateName);
  });

});
