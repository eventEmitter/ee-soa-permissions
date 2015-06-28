

    DROP SCHEMA IF EXISTS ee_soa_permissions CASCADE;
    CREATE SCHEMA ee_soa_permissions;

    


    CREATE TABLE "ee_soa_permissions"."tenant" (
        id serial NOT NULL,
        id_country integer NOT NULL,
        name character varying(45) NOT NULL,
        CONSTRAINT pk_tenant_id PRIMARY KEY (id),
        CONSTRAINT unique_tenant_name UNIQUE (name)
    );

    CREATE TABLE "ee_soa_permissions"."user" (
        id serial NOT NULL,
        id_tenant integer NOT NULL,
        created timestamp without time zone NOT NULL,
        updated timestamp without time zone,
        deleted timestamp without time zone,
        CONSTRAINT pk_user_id PRIMARY KEY (id),
        CONSTRAINT fk_user_tenant_id FOREIGN KEY (id_tenant)
          REFERENCES "ee_soa_permissions".tenant (id) MATCH SIMPLE
          ON UPDATE CASCADE ON DELETE RESTRICT
    );


    
    CREATE TABLE "ee_soa_permissions"."accessToken" (
        id serial NOT NULL,
        id_user integer NOT NULL,
        token character varying(64) NOT NULL,
        expires timestamp without time zone,
        CONSTRAINT "pk_accessToken_id" PRIMARY KEY (id),
        CONSTRAINT "fk_accessToken_user_id" FOREIGN KEY (id_user)
          REFERENCES "ee_soa_permissions"."user" (id) MATCH SIMPLE
          ON UPDATE CASCADE ON DELETE CASCADE,
        CONSTRAINT "uique_accessToken_token" UNIQUE (token)
    );



    
    CREATE TABLE "ee_soa_permissions"."rowRestrictionOperator" (
          "id"                  serial NOT NULL
        , "identifier"          varchar(80) NOT NULL
        , "decription"          text
        , "created"             timestamp without time zone NOT NULL
        , "updated"             timestamp without time zone
        , "deleted"             timestamp without time zone
        , CONSTRAINT "pk_rowRestrictionOperator_id"
            PRIMARY KEY ("id")
        , CONSTRAINT "unique_rowRestrictionOperator_identifier" 
            UNIQUE ("identifier")
    );

    
    CREATE TABLE "ee_soa_permissions"."rowRestrictionValueType" (
          "id"                  serial NOT NULL
        , "identifier"          varchar(80) NOT NULL
        , "decription"          text
        , "created"             timestamp without time zone NOT NULL
        , "updated"             timestamp without time zone
        , "deleted"             timestamp without time zone
        , CONSTRAINT "pk_rowRestrictionValueType_id"
            PRIMARY KEY ("id")
        , CONSTRAINT "unique_rowRestrictionValueType_identifier" 
            UNIQUE ("identifier")
    );

    
    CREATE TABLE "ee_soa_permissions"."rowRestrictionEntity" (
          "id"                  serial NOT NULL
        , "identifier"          varchar(80) NOT NULL
        , "decription"          text
        , "created"             timestamp without time zone NOT NULL
        , "updated"             timestamp without time zone
        , "deleted"             timestamp without time zone
        , CONSTRAINT "pk_rowRestrictionEntity_id"
            PRIMARY KEY ("id")
        , CONSTRAINT "unique_rowRestrictionEntity_identifier" 
            UNIQUE ("identifier")
    );

    
    CREATE TABLE "ee_soa_permissions"."rowRestriction" (
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
            REFERENCES "ee_soa_permissions"."rowRestrictionOperator" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE RESTRICT
        , CONSTRAINT "fk_rowRestriction_rowRestrictionValueType_id" FOREIGN KEY ("id_rowRestrictionValueType")
            REFERENCES "ee_soa_permissions"."rowRestrictionValueType" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE RESTRICT
    );


    CREATE TABLE "ee_soa_permissions"."rowRestriction_rowRestrictionEntity" (
          "id_rowRestriction"             int NOT NULL
        , "id_rowRestrictionEntity"       int NOT NULL
        , CONSTRAINT "pk_rowRestriction_rowRestrictionEntity_id"
            PRIMARY KEY ("id_rowRestriction", "id_rowRestrictionEntity")
        , CONSTRAINT "fk_rowRestriction_rowRestrictionEntity_rowRestriction_id" FOREIGN KEY ("id_rowRestriction")
            REFERENCES "ee_soa_permissions"."rowRestriction" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
        , CONSTRAINT "fk_rowRestriction_rowRestrictionEntity_rowRestrictionEntity_id" FOREIGN KEY ("id_rowRestrictionEntity")
            REFERENCES "ee_soa_permissions"."rowRestrictionEntity" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
    );




    
    CREATE TABLE "ee_soa_permissions"."permissionObjectType" (
          "id"                  serial NOT NULL
        , "identifier"          varchar(80) NOT NULL
        , "decription"          text
        , "created"             timestamp without time zone NOT NULL
        , "updated"             timestamp without time zone
        , "deleted"             timestamp without time zone
        , CONSTRAINT "pk_permissionObjectType_id"
            PRIMARY KEY ("id")
        , CONSTRAINT "unique_permissionObjectType_identifier" 
            UNIQUE ("identifier")
    );

    
    CREATE TABLE "ee_soa_permissions"."permissionObject" (
          "id"                      serial NOT NULL
        , "id_permissionObjectType" int NOT NULL
        , "identifier"              varchar(80) NOT NULL
        , "decription"              text
        , "created"                 timestamp without time zone NOT NULL
        , "updated"                 timestamp without time zone
        , "deleted"                 timestamp without time zone
        , CONSTRAINT "pk_permissionObject_id"
            PRIMARY KEY ("id")
        , CONSTRAINT "unique_permissionObject_identifier" 
            UNIQUE ("identifier")
        , CONSTRAINT "fk_permissionObject_permissionObjectType_id" FOREIGN KEY ("id_permissionObjectType")
            REFERENCES "ee_soa_permissions"."permissionObjectType" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE RESTRICT
    );

    
     CREATE TABLE "ee_soa_permissions"."permissionAction" (
          "id"                  serial NOT NULL
        , "identifier"          varchar(80) NOT NULL
        , "decription"          text
        , "created"             timestamp without time zone NOT NULL
        , "updated"             timestamp without time zone
        , "deleted"             timestamp without time zone
        , CONSTRAINT "pk_permissionAction_id"
            PRIMARY KEY ("id")
        , CONSTRAINT "unique_permissionAction_identifier" 
            UNIQUE ("identifier")
    );

    
    CREATE TABLE "ee_soa_permissions"."permission" (
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
            REFERENCES "ee_soa_permissions"."permissionObjectType" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE RESTRICT
        , CONSTRAINT "fk_permission_permissionAction_id" FOREIGN KEY ("id_permissionAction")
            REFERENCES "ee_soa_permissions"."permissionAction" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE RESTRICT
    );



    
    CREATE TABLE "ee_soa_permissions"."capability" (
          "id"                  serial NOT NULL
        , "identifier"          varchar(80) NOT NULL
        , "decription"          text
        , "created"             timestamp without time zone NOT NULL
        , "updated"             timestamp without time zone
        , "deleted"             timestamp without time zone
        , CONSTRAINT "pk_capability_id"
            PRIMARY KEY ("id")
        , CONSTRAINT "unique_capability_identifier" 
            UNIQUE ("identifier")
    );


    CREATE TABLE "ee_soa_permissions"."role" (
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


    CREATE TABLE "ee_soa_permissions"."role_capability" (
          "id_role"             int NOT NULL
        , "id_capability"       int NOT NULL
        , CONSTRAINT "pk_role_capability_id"
            PRIMARY KEY ("id_role", "id_capability")
        , CONSTRAINT "fk_role_capability_role_id" FOREIGN KEY ("id_role")
            REFERENCES "ee_soa_permissions"."role" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
        , CONSTRAINT "fk_role_capability_capability_id" FOREIGN KEY ("id_capability")
            REFERENCES "ee_soa_permissions"."capability" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
    );


    CREATE TABLE "ee_soa_permissions"."role_permission" (
          "id_role"             int NOT NULL
        , "id_permission"       int NOT NULL
        , CONSTRAINT "pk_role_permission_id"
            PRIMARY KEY ("id_role", "id_permission")
        , CONSTRAINT "fk_role_permission_role_id" FOREIGN KEY ("id_role")
            REFERENCES "ee_soa_permissions"."role" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
        , CONSTRAINT "fk_role_permission_permission_id" FOREIGN KEY ("id_permission")
            REFERENCES "ee_soa_permissions"."permission" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
    );


    CREATE TABLE "ee_soa_permissions"."role_rowRestriction" (
          "id_role"             int NOT NULL
        , "id_rowRestriction"   int NOT NULL
        , CONSTRAINT "pk_role_rowRestriction_id"
            PRIMARY KEY ("id_role", "id_rowRestriction")
        , CONSTRAINT "fk_role_rowRestriction_role_id" FOREIGN KEY ("id_role")
            REFERENCES "ee_soa_permissions"."role" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
        , CONSTRAINT "fk_role_rowRestriction_rowRestriction_id" FOREIGN KEY ("id_rowRestriction")
            REFERENCES "ee_soa_permissions"."rowRestriction" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
    );




    CREATE TABLE "ee_soa_permissions"."userGroup" (
          "id"                  serial NOT NULL
        , "id_tenant"           int NOT NULL
        , "identifier"          varchar(80) NOT NULL
        , "created"             timestamp without time zone NOT NULL
        , "updated"             timestamp without time zone
        , "deleted"             timestamp without time zone
        , CONSTRAINT "pk_userGroup_id"
            PRIMARY KEY ("id")
        , CONSTRAINT "fk_userGroup_tenant_id" FOREIGN KEY ("id_tenant")
            REFERENCES "ee_soa_permissions"."tenant" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE RESTRICT
        , CONSTRAINT "unique_userGroup_identifier" 
            UNIQUE ("identifier")
    );


    CREATE TABLE "ee_soa_permissions"."user_userGroup" (
          "id_user"             int NOT NULL
        , "id_userGroup"           int NOT NULL
        , CONSTRAINT "pk_user_userGroup_id"
            PRIMARY KEY ("id_user", "id_userGroup")
        , CONSTRAINT "fk_user_userGroup_user_id" FOREIGN KEY ("id_user")
            REFERENCES "ee_soa_permissions"."user" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
        , CONSTRAINT "fk_user_userGroup_userGroup_id" FOREIGN KEY ("id_userGroup")
            REFERENCES "ee_soa_permissions"."userGroup" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
    );



    CREATE TABLE "ee_soa_permissions"."userGroup_role" (
          "id_userGroup"       int NOT NULL
        , "id_role"            int NOT NULL
        , CONSTRAINT "pk_userGroup_role_id"
            PRIMARY KEY ("id_userGroup", "id_role")
        , CONSTRAINT "fk_userGroup_role_userGroup_id" FOREIGN KEY ("id_userGroup")
            REFERENCES "ee_soa_permissions"."userGroup" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
        , CONSTRAINT "fk_userGroup_role_role_id" FOREIGN KEY ("id_role")
            REFERENCES "ee_soa_permissions"."role" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
    );




    CREATE TABLE "ee_soa_permissions"."service" (
          "id"                  serial NOT NULL
        , "identifier"          varchar(80) NOT NULL
        , "created"             timestamp without time zone NOT NULL
        , "updated"             timestamp without time zone
        , "deleted"             timestamp without time zone
        , CONSTRAINT "pk_service_id"
            PRIMARY KEY ("id")
        , CONSTRAINT "unique_service_identifier" 
            UNIQUE ("identifier")
    );


    CREATE TABLE "ee_soa_permissions"."service_role" (
          "id_service"         int NOT NULL
        , "id_role"            int NOT NULL
        , CONSTRAINT "pk_service_role_id"
            PRIMARY KEY ("id_service", "id_role")
        , CONSTRAINT "fk_service_role_service_id" FOREIGN KEY ("id_service")
            REFERENCES "ee_soa_permissions"."service" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
        , CONSTRAINT "fk_service_role_role_id" FOREIGN KEY ("id_role")
            REFERENCES "ee_soa_permissions"."role" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
    );





    ALTER TABLE "ee_soa_permissions"."accessToken" ADD column id_service int;
    ALTER TABLE "ee_soa_permissions"."accessToken" ADD CONSTRAINT fk_accessToken_service_id FOREIGN KEY ("id_service") REFERENCES "ee_soa_permissions"."service" ("id") MATCH SIMPLE;
    ALTER TABLE "ee_soa_permissions"."accessToken" ADD CONSTRAINT check_user_or_service CHECK ((id_service is NULL and id_user is NOT NULL) or (id_service is NOT NULL and id_user is NULL));


    CREATE TABLE "ee_soa_permissions"."user_accessToken" (
          "id_user"             int NOT NULL
        , "id_accessToken"      int NOT NULL
        , CONSTRAINT "pk_user_accessToken_id"
            PRIMARY KEY ("id_user", "id_accessToken")
        , CONSTRAINT "fk_user_accessToken_user_id" FOREIGN KEY ("id_user")
            REFERENCES "ee_soa_permissions"."user" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
        , CONSTRAINT "fk_user_accessToken_accessToken_id" FOREIGN KEY ("id_accessToken")
            REFERENCES "ee_soa_permissions"."accessToken" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
    );


    CREATE TABLE "ee_soa_permissions"."service_accessToken" (
          "id_service"          int NOT NULL
        , "id_accessToken"      int NOT NULL
        , CONSTRAINT "pk_service_accessToken_id"
            PRIMARY KEY ("id_service", "id_accessToken")
        , CONSTRAINT "fk_service_accessToken_service_id" FOREIGN KEY ("id_service")
            REFERENCES "ee_soa_permissions"."service" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
        , CONSTRAINT "fk_service_accessToken_accessToken_id" FOREIGN KEY ("id_accessToken")
            REFERENCES "ee_soa_permissions"."accessToken" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
    );