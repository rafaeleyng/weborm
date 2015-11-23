# Get Started With WebORM

[WebORM on GitHub](https://github.com/rafaeleyng/weborm)

## Schema

You must define a schema in order to work with WebORM. There are 2 ways to define your schema: using a plain JavaScript objects or using the `WebORM.SchemaEntity` constructor.

Using plain JavaScript objects:

```
var schema = {
  _Base: {
    attrs: ['name'],
  },

  Game: {},

  Player: {
    attrs: ['score'],
    relsToOne: ['Game'],
    relsToMany: ['Badge']
  },

  Badge: {
    attrs: ['description']
  }
};
```

Using the `WebORM.SchemaEntity` constructor:


```
var schema = {
  _Base:  new WebORM.SchemaEntity(['name']),
  Game:   new WebORM.SchemaEntity(),
  Player: new WebORM.SchemaEntity(['score'], ['Game'], ['Badge']),
  Badge:  new WebORM.SchemaEntity(['description'])
};
```

The order of the parameters is
```
WebORM.SchemaEntity(attrs, relsToOne, relsToMany);
```


## Inheritance

Every WebORMEntity object inherits attributes from an entity called `_DefaultBase`. Currently, the only inherited attribute is the `id`, which works pretty much as an id in a relational database.

Additionaly, you can specify a custom base entity, which *must* be called `_Base`. Every WebORMEntity object will inherit the attributes defined in your `_Base`.

Note that defining a `_Base` won't have any impact on the `_DefaultBase`. So **you don't have to define the `id` attribute** yourself.


## Config

You can, optionally, pass a configuration object. Currently, there are only one possible configuration:

* `pluralization`: WebORM pluralizes entity names by just adding an 's' at the end of the word. If you want to have a correct pluralization for your entity names, you should pass everything that doesn't follow this pattern.

```
var config = {
  pluralization: {
    Country: 'Countries',
    City: 'Cities'
  }
};
```


## Initializing WebORM

```
var weborm = new WebORM(schema, config);
```


## CRUD

### Create

```
var rafael = weborm.save('Person', {name: 'Rafael', profession: 'Dev'});`
var id = rafael.id; // generated id
```

### Read

```
var rafael = weborm.find('Person', id);
```

### Update

```
rafael.name = 'Rafael Eyng';

rafael.save();
// or
weborm.save('Person', rafael);
```

### Delete

```
rafael.delete();
// or
weborm.delete('Person', id);
```

## Other operations

### all, count, first, last, page

```
var people = weborm.all('Person');
var count = weborm.count('Person');

var first = weborm.first('Person');
var last = weborm.last('Person');

var page1 = weborm.page('Person', 0, 10); // page number, page size
```

### filter

Allows you to perform more complex queries

```
var rafaelDev = modljs.filter('Person', function(record) {
  return record.name === 'Rafael' && record.profession.toLowerCase() === 'dev';
});
```


## Relationships

### Relationships 'to one'

You can set a relationship when creating a new object:

```
var brazil = weborm.save('Country', {name: 'Brazil'});
var rs = weborm.save('State',
  {
    name: 'Rio Grande do Sul',
    _countryId: brazil.id
  }
);

rs.Country.name; // 'Brazil'
rs.countryId; // 1
```

Or later:

```
var brazil = weborm.save('Country', {name: 'Brazil'});
var rs = weborm.save('State', {name: 'Rio Grande do Sul'});

rs.Country = brazil;
// or
rs.countryId = brazil.id;

rs.save();
```

WebORM will handle the inverse relationship:

```
var rs = weborm.save('State', {name: 'Rio Grande do Sul'});

var portoAlegre = weborm.save('City', {name: 'Porto Alegre', _stateId: rs.id});
var feliz = weborm.save('City', {name: 'Feliz', _stateId: rs.id});

rs.Cities; // [portoAlegre, feliz]
```

### Relationships 'to many'

You can `add` objects `To`, and `remove` objects `From` a 'to many' relationship

```
var bronze = weborm.save('Badge', {name: 'Bronze'});
var silver = weborm.save('Badge', {name: 'Silver'});
var gold = weborm.save('Badge', {name: 'Gold'});

var player = weborm.save('Player', {
  name: 'Bob',
  _badgesId: [bronze.id, silver.id]
});

weborm.addTo(gold, player);

player.Badges.length; // 3
player.Badges[2].name; // 'Gold'

weborm.removeFrom(silver, player);

player.Badges.length; // 2
player.Badges[1].name; // 'Gold'

```
