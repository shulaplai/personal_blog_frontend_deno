import { memo } from 'react';
import { Link as RouterLink } from 'react-router-dom';

const ProjectCard = memo(function ProjectCard({ project }) {
  return (
    <RouterLink
      to={`/projects/${project.slug}`}
      className="card-lift block rounded-2xl border bg-background p-5 no-underline transition-all hover:-translate-y-0.5 hover:bg-muted hover:shadow-sm"
    >
      <h3 className="text-lg font-medium text-foreground">{project.title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
        {project.short_description}
      </p>
      {project.technologies && project.technologies.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.technologies.map((tech) => (
            <span
              key={tech.id}
              className="rounded-lg border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              {tech.name}
            </span>
          ))}
        </div>
      )}
    </RouterLink>
  );
});

export default ProjectCard;
