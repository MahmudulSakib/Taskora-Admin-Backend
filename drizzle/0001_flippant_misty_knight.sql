CREATE TABLE "drive_offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"is_sim_type" boolean DEFAULT false,
	"sim_type" varchar(50),
	"duration" varchar(100) NOT NULL,
	"validation" varchar(100) NOT NULL,
	"purchase_amount" numeric NOT NULL,
	"created_at" timestamp DEFAULT now()
);
