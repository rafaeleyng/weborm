describe('WebORM', function() {

  var weborm;
  var storage;
  var schema = {
    _Base: new WebORM.SchemaEntity(['name']),
    Country: new WebORM.SchemaEntity(['abbr']),
    State: new WebORM.SchemaEntity(['abbr'], ['Country']),
    City: new WebORM.SchemaEntity([], ['State'])
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
    weborm = new WebORM(schema, config);
    weborm.storage.clean();
  });

  afterAll(function() {
    weborm.storage.clean();
  });

  it('should be defined', function() {
    expect(weborm).toBeDefined();
  });

  it('should create new object', function() {
    var country = weborm.save('Country', {name: 'country'});
    expect(country).toBeDefined();
  });

  it('should generate an id to a new object', function() {
    var country = weborm.save('Country', {name: 'country'});
    expect(country.id).toBeDefined();
  });

  it('should save to/read from client storage', function() {
    var savedObject = weborm.save('Country', { name: 'country'});
    expect(weborm.find('Country', savedObject.id)).toBeDefined();
  });

  it('should not find object with invalid id', function() {
    var invalidId = -1;
    expect(weborm.find('Country', invalidId)).toBeUndefined();    
  });

  it('shouldn\'t allow to change the id', function() {
    var country = weborm.save('Country', {name: 'country'});
    var id = country.id;
    expect(id).toBeDefined();
    country.id = -1;
    expect(country.id).toEqual(id);
  });

  it('should filter properties not in the schema', function() {
    var country = weborm.save('Country', {name: 'country', propNotInSchema: 'any value'});
    expect(country.propNotInSchema).toBeUndefined();
  });

  it('entities should inherit properties from the base entity', function() {
    var name = 'country';
    var country = weborm.save('Country', {name: name, propNotInSchema: 'any value'});
    expect(country.name).toBeDefined();
    expect(country.propNotInSchema).toBeUndefined();
  });

  it('should tell whether two WebORM objects reffer to the same record', function() {
    var country1 = weborm.save('Country', {name: 'Brazil'});
    var country1Found = weborm.find('Country', country1.id);
    var country2 = weborm.save('Country', {name: 'Peru'});
    var country2Found = weborm.find('Country', country2.id);
    var state1 = weborm.save('State', {name: 'Rio Grande do Sul'});

    expect(weborm.same(country1, country1Found)).toBeTruthy();
    expect(weborm.same(country2, country2Found)).toBeTruthy();

    expect(weborm.same(country1, country2)).toBeFalsy();
    expect(weborm.same(country1, state1)).toBeFalsy();
  });

  it('should keep objects in context and return always the same instance for a record', function() {
    var country1 = weborm.save('Country', {name: 'Brazil'});
    var country1Found = weborm.find('Country', country1.id);
    expect(country1).toEqual(country1Found);
    
    var state1 = weborm.save('State', {name: 'Rio Grande do Sul'});
    state1.Country = country1;
    state1.save();
    var state1Found = weborm.find('State', state1.id);
    expect(country1).toEqual(state1Found.Country);
  });

  it('should tell whether two WebORM objects are equal', function() {
    var brazil = weborm.save('Country', {name: 'Brazil', abbr: 'BR'});
    var brazil2 = weborm.save('Country', {name: 'Brazil', abbr: 'BRA'});
    var brasil = weborm.save('Country', {name: 'Brasil', abbr: 'BR'});
    var sc = weborm.save('State', {name: 'Santa Catarina'});

    expect(weborm.equals(brazil, brazil)).toBeTruthy();
    expect(weborm.equals(brazil, brasil)).toBeFalsy();
    expect(weborm.equals(brazil, brazil2)).toBeFalsy();
    expect(weborm.equals(brazil, sc)).toBeFalsy();
    // TODO test relationships?
    // TODO does this 'equals' method really have a point for existing?
  });

  it('should find objects previously saved', function() {
    weborm.save(ENTITY, {id: ID});
    expect(weborm.find(ENTITY, ID)).toBeDefined();
  });

  it('should find the first object of a given entity', function() {
    weborm.save(ENTITY, {id: ID});
    weborm.save(ENTITY, {id: ID+1});
    weborm.save(ENTITY, {id: ID+2});
    expect(weborm.first(ENTITY).id).toEqual(ID);
  });

  it('should find the last object of a given entity', function() {
    weborm.save(ENTITY, {id: ID});
    weborm.save(ENTITY, {id: ID+1});
    weborm.save(ENTITY, {id: ID+2});
    expect(weborm.last(ENTITY).id).toEqual(ID+2);
  });

  it('should count records of a given entity', function() {    
    var aNumberOfRecords = 6;
    for (var i = 0; i < aNumberOfRecords; i++) {
      weborm.save(ENTITY, {id: i+1});
    }
    expect(weborm.count(ENTITY)).toEqual(aNumberOfRecords);
    expect(weborm.count(ENTITY)).toEqual(weborm.all(ENTITY).length);    
  });

  it('should retrieve all records of a given entity', function() {    
    var aNumberOfRecords = 10;
    for (var i = 0; i < aNumberOfRecords; i++) {
      weborm.save(ENTITY, {id: i+1});
    }
    expect(weborm.all(ENTITY).length).toEqual(aNumberOfRecords);
  });

  it('should retrieve any page of the records of a given entity', function() {    
    var pageSize = 5;
    var numberOfPages = 3;
    var someNumberSmallerThanPageSize = pageSize - 1
    var aNumberOfRecords = (pageSize * numberOfPages) - someNumberSmallerThanPageSize;

    for (var i = 0; i < aNumberOfRecords; i++) {
      weborm.save(ENTITY, {id: i+1});
    }

    for (var pageNumber = 0; pageNumber < numberOfPages; pageNumber++) {
      if (pageNumber === numberOfPages - 1) {
        expect(weborm.page(ENTITY, pageNumber, pageSize).length).toEqual(pageSize - someNumberSmallerThanPageSize);
      } else {
        expect(weborm.page(ENTITY, pageNumber, pageSize).length).toEqual(pageSize);
      }
    }
  });

  it('should filter the records of a given entity by any property', function() {
    weborm.save(ENTITY, {name: 'Brazil', abbr: 'BR'});
    weborm.save(ENTITY, {name: 'Brazil', abbr: 'BRA'});
    weborm.save(ENTITY, {name: 'Peru', abbr: 'PE'});
    expect(weborm.count(ENTITY)).toEqual(3);
    expect(weborm.filter(ENTITY, function(data) { return data.name === 'Brazil'}).length).toEqual(2);
    expect(weborm.filter(ENTITY, function(data) { return data.name === 'Brazil' && data.abbr === 'BR'}).length).toEqual(1);
    expect(weborm.filter(ENTITY, function(data) { return data.name === 'Peru'}).length).toEqual(1);
  });

  it('should be able to delete records', function() {
    weborm.save(ENTITY);
    expect(weborm.count(ENTITY)).toEqual(1);
    weborm.save(ENTITY);
    expect(weborm.count(ENTITY)).toEqual(2);
    
    weborm.delete(ENTITY, ID);
    expect(weborm.count(ENTITY)).toEqual(1);
    weborm.delete(ENTITY, ID+1);
    expect(weborm.count(ENTITY)).toEqual(0);
  });

  it('should save a bunch of objects', function() {
    var data = [
      {name: 'Brazil'},
      {name: 'Uruguay'},
      {name: 'Argentina'},
      {name: 'Chile'}
    ];
    var dataLength = data.length;
    var countries = weborm.save('Country', data);

    expect(countries.length).toEqual(dataLength);
    expect(weborm.count('Country')).toEqual(dataLength);
    expect(weborm.all('Country').length).toEqual(dataLength);
  });

  it('should delete object when delete function is called on the object itself', function() {
    var obj = weborm.save(ENTITY, {name: 'Brazil'});
    expect(weborm.count(ENTITY)).toEqual(1);
    obj.delete();
    expect(weborm.count(ENTITY)).toEqual(0);
  });

  it('should maintain a sequential id for each entity', function() {
    var aNumberOfRecords = 5;
    for (var i = 0; i < aNumberOfRecords; i++) {
      weborm.save(ENTITY, {name: 'country'});
    }

    var count = weborm.count(ENTITY);
    expect(count).toEqual(aNumberOfRecords);

    var all = weborm.all(ENTITY);
    var lastId = all[count - 1].id;

    for (var i in all) {
      all[i].delete();
    }
    expect(weborm.count(ENTITY)).toEqual(0);
    
    var lastSaved = weborm.save(ENTITY, {name: 'country'});
    expect(lastSaved.id).toEqual(lastId + 1);
  });

  it('should tell wheter a record exists', function(){
    var br = weborm.save('Country', {name: 'Brazil'});
    var es = weborm.save('State', {name: 'Espírito Santo'});

    expect(weborm.exists('Country', br.id)).toBeTruthy();
    expect(weborm.exists('State', es.id)).toBeTruthy();

    expect(weborm.exists('Country', 2)).toBeFalsy();
    expect(weborm.exists('State', 3)).toBeFalsy();
  });

  it('shouldn\'t allow to set the id when creating a record', function() {
    weborm.save('City', {name:'Paris', id: 2});
    weborm.save('City', {name:'Nice', id: 4});
    
    var cities = weborm.all('City');
    expect(cities[0].id).toEqual(1);
    expect(cities[1].id).toEqual(2);
  });

  it('should allow to set the id when updating a record', function() {    
    var santiago = weborm.save('City', {name:'Santiago', id: 2});
    var vina = weborm.save('City', {name:'Viña', id: 4});
    
    expect(weborm.count('City')).toEqual(2);
    expect(vina.id).toEqual(2);
    
    var newName = 'Viña del Mar';
    weborm.save('City', {name: newName, id: vina.id});
    expect(weborm.count('City')).toEqual(2);
    expect(weborm.find('City', 2).name).toEqual(newName);
  });

  it('should retain all attributes after setting an relationship', function() {
    var country1 = weborm.save('Country', {name:'Brazil'});
    var state1 = weborm.save('State', {name:'Rio Grande do Sul', abbr:'RS'});

    state1.Country = country1;
    state1.save();

    var state1Found = weborm.find('State', state1.id);
    expect(state1).toEqual(state1Found);
    expect(state1.name).toEqual(state1Found.name);
    expect(state1.abbr).toEqual(state1Found.abbr);
  });

  it('should keep objects in context consistent after modifying their attributes and relationships', function() {
    var br = weborm.save('Country', {name:'Brasil'});
    var para = weborm.save('State', {name:'Para'});
    para.Country = br;
    para.save();
    var paraFound = weborm.find('State', para.id);

    var newStateName = 'Pará';
    paraFound.name = newStateName;

    expect(para).toEqual(paraFound);
    expect(para.name).toEqual(paraFound.name);
    expect(para.abbr).toEqual(paraFound.abbr);
    expect(para.name).toEqual(newStateName);
  });

});
