



    ----------------------
    --- ROWRESTRICTION ---
    ----------------------

    CREATE TABLE "eventbooster"."rowRestrictionOperator" (
          "id"                  serial NOT NULL
        , "identifier"          varchar(80) NOT NULL
        , "description"          text
        , "created"             timestamp without time zone NOT NULL
        , "updated"             timestamp without time zone
        , "deleted"             timestamp without time zone
        , CONSTRAINT "pk_rowRestrictionOperator_id"
            PRIMARY KEY ("id")
        , CONSTRAINT "unique_rowRestrictionOperator_identifier"
            UNIQUE ("identifier")
    );


    CREATE TABLE "eventbooster"."rowRestrictionValueType" (
          "id"                  serial NOT NULL
        , "identifier"          varchar(80) NOT NULL
        , "description"          text
        , "created"             timestamp without time zone NOT NULL
        , "updated"             timestamp without time zone
        , "deleted"             timestamp without time zone
        , CONSTRAINT "pk_rowRestrictionValueType_id"
            PRIMARY KEY ("id")
        , CONSTRAINT "unique_rowRestrictionValueType_identifier"
            UNIQUE ("identifier")
    );


    CREATE TABLE "eventbooster"."rowRestrictionEntity" (
          "id"                  serial NOT NULL
        , "identifier"          varchar(80) NOT NULL
        , "description"          text
        , "created"             timestamp without time zone NOT NULL
        , "updated"             timestamp without time zone
        , "deleted"             timestamp without time zone
        , CONSTRAINT "pk_rowRestrictionEntity_id"
            PRIMARY KEY ("id")
        , CONSTRAINT "unique_rowRestrictionEntity_identifier"
            UNIQUE ("identifier")
    );


    CREATE TABLE "eventbooster"."rowRestriction" (
          "id"                          serial NOT NULL
        , "id_rowRestrictionOperator"   int NOT NULL
        , "id_rowRestrictionValueType"  int NOT NULL
        , "column"                      varchar(500) NOT NULL
        , "value"                       varchar(500) NOT NULL
        , "inverted"                    bool NOT NULL DEFAULT false
        , "description"                 text
        , "created"                     timestamp without time zone NOT NULL
        , "updated"                     timestamp without time zone
        , "deleted"                     timestamp without time zone
        , CONSTRAINT "pk_rowRestriction_id"
            PRIMARY KEY ("id")
        , CONSTRAINT "fk_rowRestriction_rowRestrictionOperator_id" FOREIGN KEY ("id_rowRestrictionOperator")
            REFERENCES "eventbooster"."rowRestrictionOperator" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE RESTRICT
        , CONSTRAINT "fk_rowRestriction_rowRestrictionValueType_id" FOREIGN KEY ("id_rowRestrictionValueType")
            REFERENCES "eventbooster"."rowRestrictionValueType" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE RESTRICT
    );


    CREATE TABLE "eventbooster"."rowRestriction_rowRestrictionEntity" (
          "id_rowRestriction"             int NOT NULL
        , "id_rowRestrictionEntity"       int NOT NULL
        , CONSTRAINT "pk_rowRestriction_rowRestrictionEntity_id"
            PRIMARY KEY ("id_rowRestriction", "id_rowRestrictionEntity")
        , CONSTRAINT "fk_rowRestriction_rowRestrictionEntity_rowRestriction_id" FOREIGN KEY ("id_rowRestriction")
            REFERENCES "eventbooster"."rowRestriction" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
        , CONSTRAINT "fk_rowRestriction_rowRestrictionEntity_rowRestrictionEntity_id" FOREIGN KEY ("id_rowRestrictionEntity")
            REFERENCES "eventbooster"."rowRestrictionEntity" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
    );





    -------------------
    --- PERMISSIONS ---
    -------------------

    CREATE TABLE "eventbooster"."permissionObjectType" (
          "id"                  serial NOT NULL
        , "identifier"          varchar(80) NOT NULL
        , "description"          text
        , "created"             timestamp without time zone NOT NULL
        , "updated"             timestamp without time zone
        , "deleted"             timestamp without time zone
        , CONSTRAINT "pk_permissionObjectType_id"
            PRIMARY KEY ("id")
        , CONSTRAINT "unique_permissionObjectType_identifier"
            UNIQUE ("identifier")
    );


    CREATE TABLE "eventbooster"."permissionObject" (
          "id"                      serial NOT NULL
        , "id_permissionObjectType" int NOT NULL
        , "identifier"              varchar(80) NOT NULL
        , "description"              text
        , "created"                 timestamp without time zone NOT NULL
        , "updated"                 timestamp without time zone
        , "deleted"                 timestamp without time zone
        , CONSTRAINT "pk_permissionObject_id"
            PRIMARY KEY ("id")
        , CONSTRAINT "unique_permissionObject_identifier"
            UNIQUE ("identifier")
        , CONSTRAINT "fk_permissionObject_permissionObjectType_id" FOREIGN KEY ("id_permissionObjectType")
            REFERENCES "eventbooster"."permissionObjectType" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE RESTRICT
    );


     CREATE TABLE "eventbooster"."permissionAction" (
          "id"                  serial NOT NULL
        , "identifier"          varchar(80) NOT NULL
        , "description"          text
        , "created"             timestamp without time zone NOT NULL
        , "updated"             timestamp without time zone
        , "deleted"             timestamp without time zone
        , CONSTRAINT "pk_permissionAction_id"
            PRIMARY KEY ("id")
        , CONSTRAINT "unique_permissionAction_identifier"
            UNIQUE ("identifier")
    );


    CREATE TABLE "eventbooster"."permission" (
          "id"                      serial NOT NULL
        , "id_permissionObject"     int NOT NULL
        , "id_permissionAction"     int NOT NULL
        , "created"                 timestamp without time zone NOT NULL
        , "updated"                 timestamp without time zone
        , "deleted"                 timestamp without time zone
        , CONSTRAINT "pk_permission_id"
            PRIMARY KEY ("id")
        , CONSTRAINT "unique_permission_object_action"
            UNIQUE ("id_permissionObject", "id_permissionAction")
        , CONSTRAINT "fk_permission_permissionObject_id" FOREIGN KEY ("id_permissionObject")
            REFERENCES "eventbooster"."permissionObject" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE RESTRICT
        , CONSTRAINT "fk_permission_permissionAction_id" FOREIGN KEY ("id_permissionAction")
            REFERENCES "eventbooster"."permissionAction" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE RESTRICT
    );




    --------------------
    --- CAPABILITIES ---
    --------------------

    CREATE TABLE "eventbooster"."capability" (
          "id"                  serial NOT NULL
        , "identifier"          varchar(80) NOT NULL
        , "description"          text
        , "created"             timestamp without time zone NOT NULL
        , "updated"             timestamp without time zone
        , "deleted"             timestamp without time zone
        , CONSTRAINT "pk_capability_id"
            PRIMARY KEY ("id")
        , CONSTRAINT "unique_capability_identifier"
            UNIQUE ("identifier")
    );





    -------------
    --- ROLES ---
    -------------

    CREATE TABLE "eventbooster"."role" (
          "id"                  serial NOT NULL
        , "identifier"          varchar(80) NOT NULL
        , "created"             timestamp without time zone NOT NULL
        , "updated"             timestamp without time zone
        , "deleted"             timestamp without time zone
        , CONSTRAINT "pk_role_id"
            PRIMARY KEY ("id")
        , CONSTRAINT "unique_role_identifier"
            UNIQUE ("identifier")
    );


    CREATE TABLE "eventbooster"."role_capability" (
          "id_role"             int NOT NULL
        , "id_capability"       int NOT NULL
        , CONSTRAINT "pk_role_capability_id"
            PRIMARY KEY ("id_role", "id_capability")
        , CONSTRAINT "fk_role_capability_role_id" FOREIGN KEY ("id_role")
            REFERENCES "eventbooster"."role" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
        , CONSTRAINT "fk_role_capability_capability_id" FOREIGN KEY ("id_capability")
            REFERENCES "eventbooster"."capability" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
    );


    CREATE TABLE "eventbooster"."role_permission" (
          "id_role"             int NOT NULL
        , "id_permission"       int NOT NULL
        , CONSTRAINT "pk_role_permission_id"
            PRIMARY KEY ("id_role", "id_permission")
        , CONSTRAINT "fk_role_permission_role_id" FOREIGN KEY ("id_role")
            REFERENCES "eventbooster"."role" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
        , CONSTRAINT "fk_role_permission_permission_id" FOREIGN KEY ("id_permission")
            REFERENCES "eventbooster"."permission" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
    );


    CREATE TABLE "eventbooster"."role_rowRestriction" (
          "id_role"             int NOT NULL
        , "id_rowRestriction"   int NOT NULL
        , CONSTRAINT "pk_role_rowRestriction_id"
            PRIMARY KEY ("id_role", "id_rowRestriction")
        , CONSTRAINT "fk_role_rowRestriction_role_id" FOREIGN KEY ("id_role")
            REFERENCES "eventbooster"."role" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
        , CONSTRAINT "fk_role_rowRestriction_rowRestriction_id" FOREIGN KEY ("id_rowRestriction")
            REFERENCES "eventbooster"."rowRestriction" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
    );





    ------------------
    --- USERGROUPS ---
    ------------------

    CREATE TABLE "eventbooster"."userGroup" (
          "id"                  serial NOT NULL
        , "id_tenant"           int NOT NULL
        , "identifier"          varchar(80) NOT NULL
        , "created"             timestamp without time zone NOT NULL
        , "updated"             timestamp without time zone
        , "deleted"             timestamp without time zone
        , CONSTRAINT "pk_userGroup_id"
            PRIMARY KEY ("id")
        , CONSTRAINT "fk_userGroup_tenant_id" FOREIGN KEY ("id_tenant")
            REFERENCES "eventbooster"."tenant" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE RESTRICT
        , CONSTRAINT "unique_userGroup_identifier"
            UNIQUE ("identifier")
    );


    CREATE TABLE "eventbooster"."user_userGroup" (
          "id_user"             int NOT NULL
        , "id_userGroup"           int NOT NULL
        , CONSTRAINT "pk_user_userGroup_id"
            PRIMARY KEY ("id_user", "id_userGroup")
        , CONSTRAINT "fk_user_userGroup_user_id" FOREIGN KEY ("id_user")
            REFERENCES "eventbooster"."user" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
        , CONSTRAINT "fk_user_userGroup_userGroup_id" FOREIGN KEY ("id_userGroup")
            REFERENCES "eventbooster"."userGroup" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
    );



    CREATE TABLE "eventbooster"."userGroup_role" (
          "id_userGroup"       int NOT NULL
        , "id_role"            int NOT NULL
        , CONSTRAINT "pk_userGroup_role_id"
            PRIMARY KEY ("id_userGroup", "id_role")
        , CONSTRAINT "fk_userGroup_role_userGroup_id" FOREIGN KEY ("id_userGroup")
            REFERENCES "eventbooster"."userGroup" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
        , CONSTRAINT "fk_userGroup_role_role_id" FOREIGN KEY ("id_role")
            REFERENCES "eventbooster"."role" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
    );





    ----------------
    --- SERVICES ---
    ----------------

    CREATE TABLE "eventbooster"."service" (
          "id"                  serial NOT NULL
        , "id_tenant"           int
        , "identifier"          varchar(80) NOT NULL
        , "created"             timestamp without time zone NOT NULL
        , "updated"             timestamp without time zone
        , "deleted"             timestamp without time zone
        , CONSTRAINT "pk_service_id"
            PRIMARY KEY ("id")
        , CONSTRAINT "unique_service_identifier"
            UNIQUE ("identifier")
        , CONSTRAINT "fk_service_tenant_id" FOREIGN KEY ("id_tenant")
            REFERENCES "eventbooster"."tenant" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
    );



    CREATE TABLE "eventbooster"."service_role" (
          "id_service"         int NOT NULL
        , "id_role"            int NOT NULL
        , CONSTRAINT "pk_service_role_id"
            PRIMARY KEY ("id_service", "id_role")
        , CONSTRAINT "fk_service_role_service_id" FOREIGN KEY ("id_service")
            REFERENCES "eventbooster"."service" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
        , CONSTRAINT "fk_service_role_role_id" FOREIGN KEY ("id_role")
            REFERENCES "eventbooster"."role" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
    );





    -------------------
    --- ACCESSTOKEN ---
    -------------------

    --- ALTER TABLE "eventbooster"."accessToken" ADD column id_user int;
    ALTER TABLE "eventbooster"."accessToken" ADD column id_service int;
    --- ALTER TABLE "eventbooster"."accessToken" ADD CONSTRAINT fk_accessToken_user_id FOREIGN KEY ("id_user") REFERENCES "eventbooster"."user" ("id") MATCH SIMPLE;
    ALTER TABLE "eventbooster"."accessToken" ADD CONSTRAINT fk_accessToken_service_id FOREIGN KEY ("id_service") REFERENCES "eventbooster"."service" ("id") MATCH SIMPLE;
    ALTER TABLE "eventbooster"."accessToken" ADD CONSTRAINT check_user_or_service CHECK ((id_service is NULL and id_user is NOT NULL) or (id_service is NOT NULL and id_user is NULL));


    ALTER TABLE "eventbooster"."permission" ADD column identifier varchar(150);
    ALTER TABLE "eventbooster"."permission" ADD CONSTRAINT unique_permission_identifier UNIQUE ("identifier");

    ALTER TABLE "eventbooster"."accessToken" ALTER "id_user" DROP NOT NULL;





    INSERT INTO "eventbooster"."permissionObjectType" ("identifier", "description", "created") VALUES ('controller', 'permissions applying to controllers', now());



    INSERT INTO "eventbooster"."permissionAction" ("identifier", "description", "created") VALUES ('list', 'The list action that can be execute on permission objects', now());
    INSERT INTO "eventbooster"."permissionAction" ("identifier", "description", "created") VALUES ('listOne', 'The listOne action that can be execute on permission objects', now());
    INSERT INTO "eventbooster"."permissionAction" ("identifier", "description", "created") VALUES ('create', 'The create action that can be execute on permission objects', now());
    INSERT INTO "eventbooster"."permissionAction" ("identifier", "description", "created") VALUES ('createOrUpdate', 'The createOrUpdate action that can be execute on permission objects', now());
    INSERT INTO "eventbooster"."permissionAction" ("identifier", "description", "created") VALUES ('createRelation', 'The createRelation action that can be execute on permission objects', now());
    INSERT INTO "eventbooster"."permissionAction" ("identifier", "description", "created") VALUES ('update', 'The update action that can be execute on permission objects', now());
    INSERT INTO "eventbooster"."permissionAction" ("identifier", "description", "created") VALUES ('updateRelation', 'The updateRelation action that can be execute on permission objects', now());
    INSERT INTO "eventbooster"."permissionAction" ("identifier", "description", "created") VALUES ('delete', 'The delete action that can be execute on permission objects', now());
    INSERT INTO "eventbooster"."permissionAction" ("identifier", "description", "created") VALUES ('deleteRelation', 'The deleteRelation action that can be execute on permission objects', now());
    INSERT INTO "eventbooster"."permissionAction" ("identifier", "description", "created") VALUES ('describe', 'The describe action that can be execute on permission objects', now());
