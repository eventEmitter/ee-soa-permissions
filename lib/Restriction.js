!function() {
    'use strict';

    var   Class         = require('ee-class')
        , Eventemitter  = require('ee-event-emitter')
        , log           = require('ee-log');




    module.exports = new Class({
        inherits: Eventemitter


        // is the field also nullable?
        , nullable: false


        // is the restriction global? if yes all connected entities are exluded
        // from the restriction
        , global: false


        // the value this restriction has. this may be a constant, a function
        // or a variableName. what the value contains depends on the type
        , value: undefined


        // the type defines what the valuue of the restriction is
        , type: null


        // the comperator defineds how the value is compared to the columns value
        , comperator: null


        // the column this restriction applies to
        , column: null


        // if the filter must be aplied to a remote entity the path is stored here
        , path: null



        /**
         * class constructor, initializes the restriction
         *
         * @param {RowRestriction Model} rowRestriction the model loaded from the db
         */
        , init: function(rowRestriction) {
            var pathParts;

            // set flags
            if (rowRestriction.nullable) this.nullable = true;
            if (rowRestriction.global) this.global = true;

            // the value
            if (rowRestriction.value === undefined) throw new Error('The value of a row restriction cannot be undefined!');
            else this.value = rowRestriction.value;

            // the value
            if (rowRestriction.column === undefined) throw new Error('The column of a row restriction cannot be undefined!');
            else {
                if (rowRestriction.column.indexOf('.') >= 0) {
                    this.column = rowRestriction.column.slice(rowRestriction.column.lastIndexOf('.')+1);
                    this.path = rowRestriction.column.slice(0, rowRestriction.column.lastIndexOf('.')).split('.');
                }
                else this.column = rowRestriction.column;

                // store the originla value
                this.fullPath = rowRestriction.column;
            }

            // the comperator
            if (!rowRestriction.rowRestrictionComperator || !rowRestriction.rowRestrictionComperator.identifier) throw new Error('The restriction needs a comperator!');
            else this.comperator = rowRestriction.rowRestrictionComperator.identifier;

            // the type
            if (!rowRestriction.rowRestrictionValueType || !rowRestriction.rowRestrictionValueType.identifier) throw new Error('The restriction needs a comperator!');
            else this.type = rowRestriction.rowRestrictionValueType.identifier;


            // now its time to set up the entites
            this.entities = {};

            rowRestriction.rowRestrictionEntity.forEach(function(entity) {
                this.entities[entity.identifier] = true;
            }.bind(this));
        }








        /**
         * checks wether this restirction must be applied to an entity
         * if the restriction is global this is always false
         *
         * @param {string} entityName the name of the entity to loook for
         *
         * @returns {boolean} true if this restriction must be applied
         *                    to the entity
         */
        , hasEntitiy: function(entityName) {
            return this.global ? false : !!this.entities[entityName];
        }
    });
}();
