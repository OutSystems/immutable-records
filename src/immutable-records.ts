/**
 * Copyright (c) 2015-2016, OutSystems SA
 * All rights reserved.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for full license information.
 */

export interface IImmutableRecord {
    get(prop: string): any;
    set(prop: string, value: any): any;
    toJS(): any;
}

export type ImmutableRecordClass = new (defaults?: { [prop: string]: any }) => IImmutableRecord;

/**
 * Used to generate different name for dynamically generated record
 * classes so V8 understands how to optimize them a little better.
 */
let recordGenNumber: number = 0;

/**
 * Dynamically creates a class/constructor for a record, given some
 * specification of the 'default' for the record, containing all the fields.
 *
 * The set of fields in the record is fixed, which means you can't append
 * a new attribute later on to an instance.
 *
 * Usage example:
 *
 *     var UserRec = defineRecordClass({name: 'anonymous', age: 20});
 *     var user1 = new UserRec({name: 'John', age: 21})
 *     user1.get('age');          // 21
 *     user1.set('age', 25);      // UserRec({name: 'John', age: 25})
 *     user1.get('age');          // 21
 *     var user2 = new UserRec(); // UserRec({name: 'anonymous', age: 20})
 */
export function defineRecordClass(defaults: { [prop: string]: any }): ImmutableRecordClass {
    var keys = Object.keys(defaults);

    var ctor = `function ImmutableRecord${recordGenNumber}(o) { this._ = o || defaults }\n` +
        `function R${recordGenNumber}(o) {\n`;
    keys.forEach((key: string) => ctor += `this.${key} = o.${key};\n`);
    ctor += "}\n";

    // build the body of the 'get' function dynamically
    // using a switch that gets each attribute by direct reference
    var getBody = "switch(key){\n";
    keys.forEach((key: string) => { getBody += `case "${key}": return this._.${key};\n`; });
    getBody += "}";

    // build the body of the 'set' function dynamically
    // using a direct clone and a reflection set
    var setBody = `var clone = new R${recordGenNumber}(this._);\n`;
    setBody += "switch (key) {\n";
    keys.forEach((key: string) => { setBody += `case "${key}": clone.${key}=value;break;`; });
    setBody += "}\n";
    setBody += `return new ImmutableRecord${recordGenNumber}(clone);\n`;

    var toJSBody = "return {\n";
    toJSBody += keys.map((key: string) => `${key}: this._.${key}`).join(",\n");
    toJSBody += "\n};";

    var complete = ctor +
        `ImmutableRecord${recordGenNumber}.prototype.get = function(key){${ getBody }};\n` +
        `ImmutableRecord${recordGenNumber}.prototype.set = function(key,value){${ setBody }};\n` +
        `ImmutableRecord${recordGenNumber}.prototype.toJS = function(){${ toJSBody }};\n` +
        `return ImmutableRecord${recordGenNumber};`;

    recordGenNumber++;

    return (new Function("defaults", complete))(defaults);
}

// To ensure compatibility with immutablejs.Record
export var Record = defineRecordClass;
