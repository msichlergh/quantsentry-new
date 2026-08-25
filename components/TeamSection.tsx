import Image from "next/image";

export type TeamMember = {
  name: string;
  role: string;
  bio?: string;
  location?: string;
  image?: string;
  imageAlt?: string;
  linkedIn?: string;
  email?: string;
};

export type TeamGroup = {
  title: string;
  description?: string;
  members: readonly TeamMember[];
};

type TeamMemberCardProps = {
  member: TeamMember;
};

type TeamSectionProps = {
  groups: readonly TeamGroup[];
  eyebrow?: string;
  heading?: string;
  description?: string;
};

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

function LinkedInIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  return (
    <article className="team-card">
      <div className="team-card-media">
        {member.image ? (
          <Image
            alt={member.imageAlt ?? member.name}
            className="team-card-image"
            fill
            sizes="(max-width: 700px) 100vw, (max-width: 900px) 50vw, (max-width: 1100px) 33vw, 20vw"
            src={member.image}
          />
        ) : (
          <span className="team-card-initials" aria-hidden="true">
            {getInitials(member.name)}
          </span>
        )}
        {member.bio || member.linkedIn ? (
          <div className="team-card-overlay">
            {member.bio ? <p>{member.bio}</p> : null}
            {member.linkedIn ? (
              <a
                aria-label={`${member.name} on LinkedIn`}
                className="team-card-linkedin"
                href={member.linkedIn}
                rel="noreferrer"
                target="_blank"
              >
                <LinkedInIcon />
              </a>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="team-card-body">
        <h3>{member.name}</h3>
        <p className="team-card-role">{member.role}</p>
      </div>
    </article>
  );
}

export function TeamSection({
  groups,
  eyebrow = "Team",
  heading = "The people behind QuantSentry.",
  description,
}: TeamSectionProps) {
  if (!groups.some((group) => group.members.length > 0)) return null;

  return (
    <section className="team-section theme-light" id="team">
      <div className="wrap">
        <div className="kicker">
          <span className="dot" />
          <span>{eyebrow}</span>
        </div>
        <h2>{heading}</h2>
        {description ? <p className="lede team-section-description">{description}</p> : null}
        <div className="team-groups">
          {groups.map((group) => (
            <div className="team-group" key={group.title}>
              <div className="team-group-header">
                <h3>{group.title}</h3>
                {group.description ? <p>{group.description}</p> : null}
              </div>
              <div className="team-grid">
                {group.members.map((member) => (
                  <TeamMemberCard key={member.name} member={member} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
