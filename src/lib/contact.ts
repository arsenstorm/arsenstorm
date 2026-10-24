const FINGERPRINT_GROUP_REGEX = /.{4}/g;

export const CONTACT_DESCRIPTION = "Here's how to reach me.";

export const CONTACT_METHODS = [
	{
		copy: "arsen@shkrumelyak.com",
		description: "The most direct way to reach me, about anything.",
		handle: "arsen@shkrumelyak.com",
		href: "mailto:arsen@shkrumelyak.com",
		label: "Email",
	},
	{
		description: "For work, roles and anything career related.",
		handle: "in/arsenstorm",
		href: "https://www.linkedin.com/in/arsenstorm",
		label: "LinkedIn",
	},
	{
		description: "For issues and pull requests on my open source projects.",
		handle: "@arsenstorm",
		href: "https://github.com/arsenstorm",
		label: "GitHub",
	},
];

export const PGP = {
	email: "arsen@shkrumelyak.com",
	fingerprint: "D440EA0485482582D65EF65C05CD1A15F006FF35",
	href: "/pgp.asc",
};

export const PGP_FINGERPRINT_GROUPED =
	PGP.fingerprint.match(FINGERPRINT_GROUP_REGEX)?.join(" ") ?? PGP.fingerprint;
