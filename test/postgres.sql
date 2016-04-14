

    DROP SCHEMA IF EXISTS ee_soa_permissions CASCADE;
    CREATE SCHEMA ee_soa_permissions;



    set search_path to ee_soa_permissions;


    CREATE TABLE "address" (
        id serial NOT NULL,
        name character varying(45) NOT NULL,
        CONSTRAINT pk_address_id PRIMARY KEY (id),
        CONSTRAINT unique_address_name UNIQUE (name)
    );


    CREATE TABLE "tenant" (
        id serial NOT NULL,
        name character varying(45) NOT NULL,
        CONSTRAINT pk_tenant_id PRIMARY KEY (id),
        CONSTRAINT unique_tenant_name UNIQUE (name)
    );

    CREATE TABLE "user" (
        id serial NOT NULL,
        id_tenant integer NOT NULL,
        created timestamp without time zone NOT NULL,
        updated timestamp without time zone,
        deleted timestamp without time zone,
        CONSTRAINT pk_user_id PRIMARY KEY (id),
        CONSTRAINT fk_user_tenant_id FOREIGN KEY (id_tenant)
          REFERENCES tenant (id) MATCH SIMPLE
          ON UPDATE CASCADE ON DELETE RESTRICT
    );



    CREATE TABLE "userProfile" (
        id_user integer NOT NULL,
        "firstName" character varying(255),
        "lastName" character varying(255),
        address character varying(255),
        zip character varying(100),
        city character varying(100),
        birthdate date,
        phone character varying(100),
        CONSTRAINT "pk_userProfile_id" PRIMARY KEY (id_user),
        CONSTRAINT "fk_userProfile_user_id" FOREIGN KEY (id_user)
          REFERENCES "user" (id) MATCH SIMPLE
          ON UPDATE CASCADE ON DELETE CASCADE
    );


    CREATE TABLE "userLoginEmail" (
        id_user integer NOT NULL,
        email character varying(255) NOT NULL,
        nonce character varying(128) NOT NULL,
        password character varying(128) NOT NULL,
        CONSTRAINT "pk_userLoginEmail_id" PRIMARY KEY (id_user),
        CONSTRAINT "fk_userLoginEmail_user_id" FOREIGN KEY (id_user)
          REFERENCES "user" (id) MATCH SIMPLE
          ON UPDATE CASCADE ON DELETE CASCADE
    );


    CREATE TABLE "accessToken" (
        id serial NOT NULL,
        id_user integer,
        token character varying(64) NOT NULL,
        expires timestamp without time zone,
         "created"             timestamp without time zone NOT NULL
        , "updated"             timestamp without time zone
        , "deleted"             timestamp without time zone,
        CONSTRAINT "pk_accessToken_id" PRIMARY KEY (id),
        CONSTRAINT "fk_accessToken_user_id" FOREIGN KEY (id_user)
          REFERENCES "user" (id) MATCH SIMPLE
          ON UPDATE CASCADE ON DELETE CASCADE,
        CONSTRAINT "uique_accessToken_token" UNIQUE (token)
    );




    CREATE TABLE "rowRestrictionComperator" (
          "id"                  serial NOT NULL
        , "identifier"          varchar(80) NOT NULL
        , "description"          text
        , "created"             timestamp without time zone NOT NULL
        , "updated"             timestamp without time zone
        , "deleted"             timestamp without time zone
        , CONSTRAINT "pk_rowRestrictionComperator_id"
            PRIMARY KEY ("id")
        , CONSTRAINT "unique_rowRestrictionComperator_identifier"
            UNIQUE ("identifier")
    );


    CREATE TABLE "rowRestrictionValueType" (
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


    CREATE TABLE "rowRestrictionEntity" (
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


    CREATE TABLE "rowRestriction" (
          "id"                          serial NOT NULL
        , "id_rowRestrictionComperator"   int NOT NULL
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
        , CONSTRAINT "fk_rowRestriction_rowRestrictionComperator_id" FOREIGN KEY ("id_rowRestrictionComperator")
            REFERENCES "rowRestrictionComperator" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE RESTRICT
        , CONSTRAINT "fk_rowRestriction_rowRestrictionValueType_id" FOREIGN KEY ("id_rowRestrictionValueType")
            REFERENCES "rowRestrictionValueType" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE RESTRICT
    );


    CREATE TABLE "rowRestriction_rowRestrictionEntity" (
          "id_rowRestriction"             int NOT NULL
        , "id_rowRestrictionEntity"       int NOT NULL
        , CONSTRAINT "pk_rowRestriction_rowRestrictionEntity_id"
            PRIMARY KEY ("id_rowRestriction", "id_rowRestrictionEntity")
        , CONSTRAINT "fk_rowRestriction_rowRestrictionEntity_rowRestriction_id" FOREIGN KEY ("id_rowRestriction")
            REFERENCES "rowRestriction" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
        , CONSTRAINT "fk_rowRestriction_rowRestrictionEntity_rowRestrictionEntity_id" FOREIGN KEY ("id_rowRestrictionEntity")
            REFERENCES "rowRestrictionEntity" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
    );





    CREATE TABLE "permissionObjectType" (
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


    CREATE TABLE "permissionObject" (
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
            REFERENCES "permissionObjectType" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE RESTRICT
    );


     CREATE TABLE "permissionAction" (
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


    CREATE TABLE "permission" (
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
            REFERENCES "permissionObject" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE RESTRICT
        , CONSTRAINT "fk_permission_permissionAction_id" FOREIGN KEY ("id_permissionAction")
            REFERENCES "permissionAction" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE RESTRICT
    );




    CREATE TABLE "capability" (
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


    CREATE TABLE "role" (
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


    CREATE TABLE "role_capability" (
          "id_role"             int NOT NULL
        , "id_capability"       int NOT NULL
        , CONSTRAINT "pk_role_capability_id"
            PRIMARY KEY ("id_role", "id_capability")
        , CONSTRAINT "fk_role_capability_role_id" FOREIGN KEY ("id_role")
            REFERENCES "role" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
        , CONSTRAINT "fk_role_capability_capability_id" FOREIGN KEY ("id_capability")
            REFERENCES "capability" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
    );


    CREATE TABLE "role_permission" (
          "id_role"             int NOT NULL
        , "id_permission"       int NOT NULL
        , CONSTRAINT "pk_role_permission_id"
            PRIMARY KEY ("id_role", "id_permission")
        , CONSTRAINT "fk_role_permission_role_id" FOREIGN KEY ("id_role")
            REFERENCES "role" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
        , CONSTRAINT "fk_role_permission_permission_id" FOREIGN KEY ("id_permission")
            REFERENCES "permission" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
    );


    CREATE TABLE "role_rowRestriction" (
          "id_role"             int NOT NULL
        , "id_rowRestriction"   int NOT NULL
        , CONSTRAINT "pk_role_rowRestriction_id"
            PRIMARY KEY ("id_role", "id_rowRestriction")
        , CONSTRAINT "fk_role_rowRestriction_role_id" FOREIGN KEY ("id_role")
            REFERENCES "role" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
        , CONSTRAINT "fk_role_rowRestriction_rowRestriction_id" FOREIGN KEY ("id_rowRestriction")
            REFERENCES "rowRestriction" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
    );




    CREATE TABLE "userGroup" (
          "id"                  serial NOT NULL
        , "id_tenant"           int NOT NULL
        , "identifier"          varchar(80) NOT NULL
        , "created"             timestamp without time zone NOT NULL
        , "updated"             timestamp without time zone
        , "deleted"             timestamp without time zone
        , CONSTRAINT "pk_userGroup_id"
            PRIMARY KEY ("id")
        , CONSTRAINT "fk_userGroup_tenant_id" FOREIGN KEY ("id_tenant")
            REFERENCES "tenant" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE RESTRICT
        , CONSTRAINT "unique_userGroup_identifier"
            UNIQUE ("identifier")
    );


    CREATE TABLE "user_userGroup" (
          "id_user"             int NOT NULL
        , "id_userGroup"           int NOT NULL
        , CONSTRAINT "pk_user_userGroup_id"
            PRIMARY KEY ("id_user", "id_userGroup")
        , CONSTRAINT "fk_user_userGroup_user_id" FOREIGN KEY ("id_user")
            REFERENCES "user" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
        , CONSTRAINT "fk_user_userGroup_userGroup_id" FOREIGN KEY ("id_userGroup")
            REFERENCES "userGroup" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
    );



    CREATE TABLE "userGroup_role" (
          "id_userGroup"       int NOT NULL
        , "id_role"            int NOT NULL
        , CONSTRAINT "pk_userGroup_role_id"
            PRIMARY KEY ("id_userGroup", "id_role")
        , CONSTRAINT "fk_userGroup_role_userGroup_id" FOREIGN KEY ("id_userGroup")
            REFERENCES "userGroup" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
        , CONSTRAINT "fk_userGroup_role_role_id" FOREIGN KEY ("id_role")
            REFERENCES "role" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
    );



    CREATE TABLE "service" (
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
            REFERENCES "tenant" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
    );


    CREATE TABLE "service_role" (
          "id_service"         int NOT NULL
        , "id_role"            int NOT NULL
        , CONSTRAINT "pk_service_role_id"
            PRIMARY KEY ("id_service", "id_role")
        , CONSTRAINT "fk_service_role_service_id" FOREIGN KEY ("id_service")
            REFERENCES "service" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
        , CONSTRAINT "fk_service_role_role_id" FOREIGN KEY ("id_role")
            REFERENCES "role" ("id") MATCH SIMPLE
            ON UPDATE CASCADE ON DELETE CASCADE
    );





    ALTER TABLE "accessToken" ADD column id_service int;
    ALTER TABLE "accessToken" ADD CONSTRAINT fk_accessToken_service_id FOREIGN KEY ("id_service") REFERENCES "service" ("id") MATCH SIMPLE;
    ALTER TABLE "accessToken" ADD CONSTRAINT check_user_or_service CHECK ((id_service is NULL and id_user is NOT NULL) or (id_service is NOT NULL and id_user is NULL));


    ALTER TABLE "permission" ADD column identifier varchar(150);
    ALTER TABLE "permission" ADD CONSTRAINT unique_permission_identifier UNIQUE ("identifier");



    INSERT INTO "permissionObjectType" ("identifier", "description", "created") VALUES ('controller', 'permissions applying to controllers', now());

    INSERT INTO "permissionAction" ("identifier", "description", "created") VALUES ('read', 'The read action that can be execute on permission objects', now());
    INSERT INTO "permissionAction" ("identifier", "description", "created") VALUES ('create', 'The create action that can be execute on permission objects', now());
    INSERT INTO "permissionAction" ("identifier", "description", "created") VALUES ('update', 'The update action that can be execute on permission objects', now());
    INSERT INTO "permissionAction" ("identifier", "description", "created") VALUES ('delete', 'The delete action that can be execute on permission objects', now());





    ALTER TABLE "rowRestriction" ADD COLUMN "nullable" boolean;
    ALTER TABLE "rowRestriction" ALTER COLUMN "nullable" SET NOT NULL;
    ALTER TABLE "rowRestriction" ALTER COLUMN "nullable" SET DEFAULT false;

    ALTER TABLE "rowRestriction" ADD COLUMN "global" boolean;
    ALTER TABLE "rowRestriction" ALTER COLUMN "global" SET NOT NULL;
    ALTER TABLE "rowRestriction" ALTER COLUMN "global" SET DEFAULT false;


    ALTER TABLE "rowRestriction" DROP COLUMN inverted;


    INSERT INTO "rowRestrictionComperator" ("identifier", "description", "created") VALUES ('=', 'the value in the column must equal to', now());
    INSERT INTO "rowRestrictionComperator" ("identifier", "description", "created") VALUES ('!=', 'the value in the column must not equal to', now());
    INSERT INTO "rowRestrictionComperator" ("identifier", "description", "created") VALUES ('in', 'the value in the column must be one of', now());
    INSERT INTO "rowRestrictionComperator" ("identifier", "description", "created") VALUES ('notIn', 'the value in the column must be not on of', now());
    INSERT INTO "rowRestrictionComperator" ("identifier", "description", "created") VALUES ('>', 'the value in the column must be greather than', now());
    INSERT INTO "rowRestrictionComperator" ("identifier", "description", "created") VALUES ('<', 'the value in the column must be less than', now());
    INSERT INTO "rowRestrictionComperator" ("identifier", "description", "created") VALUES ('>=', 'the value in the column must be greather than or equal to', now());
    INSERT INTO "rowRestrictionComperator" ("identifier", "description", "created") VALUES ('<=', 'the value in the column must be less than or equal to', now());


    INSERT INTO "rowRestrictionValueType" ("identifier", "description", "created") VALUES ('constant', 'the column must be compared to a constant value', now());
    INSERT INTO "rowRestrictionValueType" ("identifier", "description", "created") VALUES ('function', 'the column must be compared to the result fo a function', now());
    INSERT INTO "rowRestrictionValueType" ("identifier", "description", "created") VALUES ('variable', 'the column must be compared to a variable', now());



    INSERT INTO "rowRestriction" ("id_rowRestrictionComperator", "id_rowRestrictionValueType", "column", "value", "created") VALUES (1, 3, 'id_tenant', 'tenant.id', now());

    INSERT INTO "rowRestrictionEntity" ("identifier", "created") VALUES ('persons', now());

    INSERT INTO "rowRestriction_rowRestrictionEntity" ("id_rowRestriction", "id_rowRestrictionEntity") VALUES (1, 1);


   

    set search_path to eventbooster;



    CREATE TABLE "company" (
          "id"                serial
        , "id_tenant"         int not null
        , "id_address"        int
        , "identifier"        varchar (100) NOT NULL
        , "name"              varchar (200) NOT NULL
        , "created"           timestamp without time zone NOT NULL DEFAULT now()
        , "updated"           timestamp without time zone NOT NULL DEFAULT now()
        , "deleted"           timestamp without time zone
        , CONSTRAINT "company_pk" 
            PRIMARY KEY ("id")
        , CONSTRAINT "company_fk_tenant_id" 
            FOREIGN KEY ("id_tenant")
            REFERENCES "tenant" ("id")
            ON UPDATE CASCADE
            ON DELETE RESTRICT
        , CONSTRAINT "company_fk_address_id" 
            FOREIGN KEY ("id_address")
            REFERENCES "address" ("id")
            ON UPDATE CASCADE
            ON DELETE RESTRICT
    );


    CREATE TABLE "companyUserRole" (
          "id"                serial
        , "identifier"        varchar (100) NOT NULL
        , "description"       text
        , "created"           timestamp without time zone NOT NULL DEFAULT now()
        , "updated"           timestamp without time zone NOT NULL DEFAULT now()
        , "deleted"           timestamp without time zone
        , CONSTRAINT "companyUserRole_pk" 
            PRIMARY KEY ("id")
    );



    CREATE TABLE "company_user" (
          "id_company"         int not null
        , "id_user"            int not null
        , "id_companyUserRole" int not null
        , CONSTRAINT "company_user_pk" 
            PRIMARY KEY ("id_company", "id_user")
        , CONSTRAINT "company_user_fk_user_id" 
            FOREIGN KEY ("id_user")
            REFERENCES "user" ("id")
            ON UPDATE CASCADE
            ON DELETE RESTRICT
        , CONSTRAINT "company_user_fk_company_id" 
            FOREIGN KEY ("id_company")
            REFERENCES "company" ("id")
            ON UPDATE CASCADE
            ON DELETE RESTRICT
        , CONSTRAINT "company_user_fk_companyUserRole_id" 
            FOREIGN KEY ("id_companyUserRole")
            REFERENCES "companyUserRole" ("id")
            ON UPDATE CASCADE
            ON DELETE RESTRICT
    );






    CREATE TABLE "app" (
          "id"                serial
        , "id_tenant"         int not null
        , "id_company"        int not null
        , "identifier"        varchar (100) NOT NULL
        , "name"              varchar (200) NOT NULL
        , "contactEmail"      varchar (200) NOT NULL
        , "contactPhone"      varchar (200) 
        , "comments"          text
        , "created"           timestamp without time zone NOT NULL DEFAULT now()
        , "updated"           timestamp without time zone NOT NULL DEFAULT now()
        , "deleted"           timestamp without time zone
        , CONSTRAINT "app_pk" 
            PRIMARY KEY ("id")
        , CONSTRAINT "app_fk_tenant_id" 
            FOREIGN KEY ("id_tenant")
            REFERENCES "tenant" ("id")
            ON UPDATE CASCADE
            ON DELETE RESTRICT
        , CONSTRAINT "app_fk_company_id" 
            FOREIGN KEY ("id_company")
            REFERENCES "company" ("id")
            ON UPDATE CASCADE
            ON DELETE RESTRICT
    );

    

    CREATE TABLE "app_role" (
          "id_app"            int not null
        , "id_role"           int not null
        , CONSTRAINT "app_role_pk" 
            PRIMARY KEY ("id_role", "id_app")
        , CONSTRAINT "app_role_fk_role_id" 
            FOREIGN KEY ("id_role")
            REFERENCES "role" ("id")
            ON UPDATE CASCADE
            ON DELETE RESTRICT
        , CONSTRAINT "app_role_fk_app_id" 
            FOREIGN KEY ("id_app")
            REFERENCES "app" ("id")
            ON UPDATE CASCADE
            ON DELETE RESTRICT
    );




    CREATE TABLE "rateLimit" (
          "id"                serial
        , "id_app"            int not null
        , "comment"           text
        , "interval"          int not null
        , "limit"             int not null
        , "burstLimit"        int not null
        , "created"           timestamp without time zone NOT NULL DEFAULT now()
        , "updated"           timestamp without time zone NOT NULL DEFAULT now()
        , "deleted"           timestamp without time zone
        , CONSTRAINT "rateLimit_pk" 
            PRIMARY KEY ("id")
        , CONSTRAINT "rateLimit_fk_app_id" 
            FOREIGN KEY ("id_app")
            REFERENCES "app" ("id")
            ON UPDATE CASCADE
            ON DELETE RESTRICT
    );


    CREATE TABLE "rateLimitRequestLog" (
          "id"                serial
        , "id_rateLimit"      int not null
        , "cost"              int not null
        , "costFactor"        numeric(4,2)
        , "url"               varchar (300) not null
        , "responseSize"      int not null
        , "headers"           json not null
        , "created"           timestamp without time zone NOT NULL DEFAULT now()
        , CONSTRAINT "rateLimitRequestLog_pk" 
            PRIMARY KEY ("id")
        , CONSTRAINT "rateLimitRequestLog_fk_rateLimit_id" 
            FOREIGN KEY ("id_rateLimit")
            REFERENCES "rateLimit" ("id")
            ON UPDATE CASCADE
            ON DELETE CASCADE
    );



    ALTER TABLE "accessToken" DROP CONSTRAINT check_user_or_service;
    ALTER TABLE "accessToken" ADD column "id_app" int;
    ALTER TABLE "accessToken" ADD CONSTRAINT "fk_accesstoken_app_id" 
            FOREIGN KEY ("id_app")
            REFERENCES "app" ("id")
            ON UPDATE CASCADE
            ON DELETE RESTRICT;
    ALTER TABLE "accessToken" ADD CONSTRAINT "check_user_or_service_or_app" 
            CHECK (
                id_service IS NULL AND id_app IS NULL AND id_user IS NOT NULL 
             OR id_service IS NOT NULL AND id_user IS NULL AND id_app IS NULL
             OR id_service IS NULL AND id_user IS NULL AND id_app IS NOT NULL
            );