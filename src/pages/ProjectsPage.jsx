const projects = [
  {
    name: 'erplab',
    url: 'https://github.com/ucdavis/erplab',
    repowise: 'https://repowise.org/ucdavis/erplab',
    ossprey: 'https://ossprey.org/ucdavis/erplab',
  },
  {
    name: 'wayfinding',
    url: 'https://github.com/ucdavis/wayfinding',
    repowise: 'https://repowise.org/ucdavis/wayfinding',
    ossprey: 'https://ossprey.org/ucdavis/wayfinding',
  },
  {
    name: 'sitefarm_seed',
    url: 'https://github.com/ucdavis/sitefarm_seed',
    repowise: 'https://repowise.org/ucdavis/sitefarm_seed',
    ossprey: 'https://ossprey.org/ucdavis/sitefarm_seed',
  },
  {
    name: 'FairMLCourse',
    url: 'https://github.com/ucdavis/FairMLCourse',
    repowise: 'https://repowise.org/ucdavis/FairMLCourse',
    ossprey: 'https://ossprey.org/ucdavis/FairMLCourse',
  },
  {
    name: 'ecs132',
    url: 'https://github.com/ucdavis/ecs132',
    repowise: 'https://repowise.org/ucdavis/ecs132',
    ossprey: 'https://ossprey.org/ucdavis/ecs132',
  },
  {
    name: 'UCDArch',
    url: 'https://github.com/ucdavis/UCDArch',
    repowise: 'https://repowise.org/ucdavis/UCDArch',
    ossprey: 'https://ossprey.org/ucdavis/UCDArch',
  },
  {
    name: 'Walter',
    url: 'https://github.com/ucdavis/Walter',
    repowise: 'https://repowise.org/ucdavis/Walter',
    ossprey: 'https://ossprey.org/ucdavis/Walter',
  },
  {
    name: 'VIPER',
    url: 'https://github.com/ucdavis/VIPER',
    repowise: 'https://repowise.org/ucdavis/VIPER',
    ossprey: 'https://ossprey.org/ucdavis/VIPER',
  },
  {
    name: 'PolicyWonk',
    url: 'https://github.com/ucdavis/PolicyWonk',
    repowise: 'https://repowise.org/ucdavis/PolicyWonk',
    ossprey: 'https://ossprey.org/ucdavis/PolicyWonk',
  },
  {
    name: 'app-template',
    url: 'https://github.com/ucdavis/app-template',
    repowise: 'https://repowise.org/ucdavis/app-template',
    ossprey: 'https://ossprey.org/ucdavis/app-template',
  },
  {
    name: 'CRU',
    url: 'https://github.com/ucdavis/CRU',
    repowise: 'https://repowise.org/ucdavis/CRU',
    ossprey: 'https://ossprey.org/ucdavis/CRU',
  },
  {
    name: 'serodynamics',
    url: 'https://github.com/ucdavis/serodynamics',
    repowise: 'https://repowise.org/ucdavis/serodynamics',
    ossprey: 'https://ossprey.org/ucdavis/serodynamics',
  },
  {
    name: 'hpccf-docs',
    url: 'https://github.com/ucdavis/hpccf-docs',
    repowise: 'https://repowise.org/ucdavis/hpccf-docs',
    ossprey: 'https://ossprey.org/ucdavis/hpccf-docs',
  },
  {
    name: 'finjector',
    url: 'https://github.com/ucdavis/finjector',
    repowise: 'https://repowise.org/ucdavis/finjector',
    ossprey: 'https://ossprey.org/ucdavis/finjector',
  },
  {
    name: 'payments',
    url: 'https://github.com/ucdavis/payments',
    repowise: 'https://repowise.org/ucdavis/payments',
    ossprey: 'https://ossprey.org/ucdavis/payments',
  },
  {
    name: 'ipa-client-angular',
    url: 'https://github.com/ucdavis/ipa-client-angular',
    repowise: 'https://repowise.org/ucdavis/ipa-client-angular',
    ossprey: 'https://ossprey.org/ucdavis/ipa-client-angular',
  },
  {
    name: 'software-catalog',
    url: 'https://github.com/ucdavis/software-catalog',
    repowise: 'https://repowise.org/ucdavis/software-catalog',
    ossprey: 'https://ossprey.org/ucdavis/software-catalog',
  },
  {
    name: 'harvest-mobile',
    url: 'https://github.com/ucdavis/harvest-mobile',
    repowise: 'https://repowise.org/ucdavis/harvest-mobile',
    ossprey: 'https://ossprey.org/ucdavis/harvest-mobile',
  },
  {
    name: 'lplus-lab.github.io',
    url: 'https://github.com/ucdavis/lplus-lab.github.io',
    repowise: 'https://repowise.org/ucdavis/lplus-lab.github.io',
    ossprey: 'https://ossprey.org/ucdavis/lplus-lab.github.io',
  },
  {
    name: 'ArgusVision',
    url: 'https://github.com/ucdavis/ArgusVision',
    repowise: 'https://repowise.org/ucdavis/ArgusVision',
    ossprey: 'https://ossprey.org/ucdavis/ArgusVision',
  },
  {
    name: 'readable',
    url: 'https://github.com/ucdavis/readable',
    repowise: 'https://repowise.org/ucdavis/readable',
    ossprey: 'https://ossprey.org/ucdavis/readable',
  },
  {
    name: 'win',
    url: 'https://github.com/ucdavis/win',
    repowise: 'https://repowise.org/ucdavis/win',
    ossprey: 'https://ossprey.org/ucdavis/win',
  },
  {
    name: 'CRP',
    url: 'https://github.com/ucdavis/CRP',
    repowise: 'https://repowise.org/ucdavis/CRP',
    ossprey: 'https://ossprey.org/ucdavis/CRP',
  },
  {
    name: 'gunrock-tailwind',
    url: 'https://github.com/ucdavis/gunrock-tailwind',
    repowise: 'https://repowise.org/ucdavis/gunrock-tailwind',
    ossprey: 'https://ossprey.org/ucdavis/gunrock-tailwind',
  },
  {
    name: 'ANNA-AnimalHealthAnalytics',
    url: 'https://github.com/ucdavis/ANNA-AnimalHealthAnalytics',
    repowise: 'https://repowise.org/ucdavis/ANNA-AnimalHealthAnalytics',
    ossprey: 'https://ossprey.org/ucdavis/ANNA-AnimalHealthAnalytics',
  },
  {
    name: 'iwfm',
    url: 'https://github.com/ucdavis/iwfm',
    repowise: 'https://repowise.org/ucdavis/iwfm',
    ossprey: 'https://ossprey.org/ucdavis/iwfm',
  },
  {
    name: 'Peaks',
    url: 'https://github.com/ucdavis/Peaks',
    repowise: 'https://repowise.org/ucdavis/Peaks',
    ossprey: 'https://ossprey.org/ucdavis/Peaks',
  },
  {
    name: 'hippo',
    url: 'https://github.com/ucdavis/hippo',
    repowise: 'https://repowise.org/ucdavis/hippo',
    ossprey: 'https://ossprey.org/ucdavis/hippo',
  },
  {
    name: 'ad419-charts',
    url: 'https://github.com/ucdavis/ad419-charts',
    repowise: 'https://repowise.org/ucdavis/ad419-charts',
    ossprey: 'https://ossprey.org/ucdavis/ad419-charts',
  },
  {
    name: 'ECS272-Fall2022',
    url: 'https://github.com/ucdavis/ECS272-Fall2022',
    repowise: 'https://repowise.org/ucdavis/ECS272-Fall2022',
    ossprey: 'https://ossprey.org/ucdavis/ECS272-Fall2022',
  },
  {
    name: 'Intro-to-Desktop-GIS-with-QGIS',
    url: 'https://github.com/ucdavis/Intro-to-Desktop-GIS-with-QGIS',
    repowise: 'https://repowise.org/ucdavis/Intro-to-Desktop-GIS-with-QGIS',
    ossprey: 'https://ossprey.org/ucdavis/Intro-to-Desktop-GIS-with-QGIS',
  },
  {
    name: 'Spatial_SQL',
    url: 'https://github.com/ucdavis/Spatial_SQL',
    repowise: 'https://repowise.org/ucdavis/Spatial_SQL',
    ossprey: 'https://ossprey.org/ucdavis/Spatial_SQL',
  },
  {
    name: 'workshop_intro_to_sql',
    url: 'https://github.com/ucdavis/workshop_intro_to_sql',
    repowise: 'https://repowise.org/ucdavis/workshop_intro_to_sql',
    ossprey: 'https://ossprey.org/ucdavis/workshop_intro_to_sql',
  },
  {
    name: 'workshop_python_basics',
    url: 'https://github.com/ucdavis/workshop_python_basics',
    repowise: 'https://repowise.org/ucdavis/workshop_python_basics',
    ossprey: 'https://ossprey.org/ucdavis/workshop_python_basics',
  },
  {
    name: 'workshop_introduction_to_version_control',
    url: 'https://github.com/ucdavis/workshop_introduction_to_version_control',
    repowise: 'https://repowise.org/ucdavis/workshop_introduction_to_version_control',
    ossprey: 'https://ossprey.org/ucdavis/workshop_introduction_to_version_control',
  },
  {
    name: 'workshop_web_maps',
    url: 'https://github.com/ucdavis/workshop_web_maps',
    repowise: 'https://repowise.org/ucdavis/workshop_web_maps',
    ossprey: 'https://ossprey.org/ucdavis/workshop_web_maps',
  },
  {
    name: 'adventures_in_data_science',
    url: 'https://github.com/ucdavis/adventures_in_data_science',
    repowise: 'https://repowise.org/ucdavis/adventures_in_data_science',
    ossprey: 'https://ossprey.org/ucdavis/adventures_in_data_science',
  },
  {
    name: 'aggie-experts',
    url: 'https://github.com/ucdavis/aggie-experts',
    repowise: 'https://repowise.org/ucdavis/aggie-experts',
    ossprey: 'https://ossprey.org/ucdavis/aggie-experts',
  },
  {
    name: 'aggie-experts-deployment',
    url: 'https://github.com/ucdavis/aggie-experts-deployment',
    repowise: 'https://repowise.org/ucdavis/aggie-experts-deployment',
    ossprey: 'https://ossprey.org/ucdavis/aggie-experts-deployment',
  },
  {
    name: 'postgres',
    url: 'https://github.com/ucdavis/postgres',
    repowise: 'https://repowise.org/ucdavis/postgres',
    ossprey: 'https://ossprey.org/ucdavis/postgres',
  },
  {
    name: 'dams-deployment',
    url: 'https://github.com/ucdavis/dams-deployment',
    repowise: 'https://repowise.org/ucdavis/dams-deployment',
    ossprey: 'https://ossprey.org/ucdavis/dams-deployment',
  },
  {
    name: 'clonalvdjseq',
    url: 'https://github.com/ucdavis/clonalvdjseq',
    repowise: 'https://repowise.org/ucdavis/clonalvdjseq',
    ossprey: 'https://ossprey.org/ucdavis/clonalvdjseq',
  },
  {
    name: 'scRNA_shiny',
    url: 'https://github.com/ucdavis/scRNA_shiny',
    repowise: 'https://repowise.org/ucdavis/scRNA_shiny',
    ossprey: 'https://ossprey.org/ucdavis/scRNA_shiny',
  },
  {
    name: 'assemblathon2-analysis',
    url: 'https://github.com/ucdavis/assemblathon2-analysis',
    repowise: 'https://repowise.org/ucdavis/assemblathon2-analysis',
    ossprey: 'https://ossprey.org/ucdavis/assemblathon2-analysis',
  },
  {
    name: 'proc10xG',
    url: 'https://github.com/ucdavis/proc10xG',
    repowise: 'https://repowise.org/ucdavis/proc10xG',
    ossprey: 'https://ossprey.org/ucdavis/proc10xG',
  },
  {
    name: 'sickle',
    url: 'https://github.com/ucdavis/sickle',
    repowise: 'https://repowise.org/ucdavis/sickle',
    ossprey: 'https://ossprey.org/ucdavis/sickle',
  },
  {
    name: 'sabre',
    url: 'https://github.com/ucdavis/sabre',
    repowise: 'https://repowise.org/ucdavis/sabre',
    ossprey: 'https://ossprey.org/ucdavis/sabre',
  },
  {
    name: 'NeuroMabSeq',
    url: 'https://github.com/ucdavis/NeuroMabSeq',
    repowise: 'https://repowise.org/ucdavis/NeuroMabSeq',
    ossprey: 'https://ossprey.org/ucdavis/NeuroMabSeq',
  },
  {
    name: 'module_counter',
    url: 'https://github.com/ucdavis/module_counter',
    repowise: 'https://repowise.org/ucdavis/module_counter',
    ossprey: 'https://ossprey.org/ucdavis/module_counter',
  },
  {
    name: 'biocore-tools',
    url: 'https://github.com/ucdavis/biocore-tools',
    repowise: 'https://repowise.org/ucdavis/biocore-tools',
    ossprey: 'https://ossprey.org/ucdavis/biocore-tools',
  },
]

const columns = [
  { label: 'Repo Name', key: 'name' },
  { label: 'Repo URL', key: 'url' },
  { label: 'RepoWise Link', key: 'repowise' },
  { label: 'OSSPREY Link', key: 'ossprey' },
]

function ProjectsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-10">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
            UC Davis OSS Portfolio
          </span>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">
            UC Davis Open Source Projects
          </h1>
          <p className="max-w-2xl text-base text-slate-300">
            One-page overview of UC Davis repositories with direct links to their GitHub sources
            alongside RepoWise and OSSPREY lookup links.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 shadow-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-slate-900/90 text-xs uppercase tracking-[0.18em] text-slate-400">
                <tr>
                  {columns.map(column => (
                    <th
                      key={column.key}
                      scope="col"
                      className="border-b border-white/10 px-4 py-4 font-semibold"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-slate-200">
                {projects.map((project, index) => (
                  <tr
                    key={project.url}
                    className={index % 2 === 0 ? 'bg-white/0' : 'bg-white/5'}
                  >
                    <td className="border-b border-white/10 px-4 py-4 font-medium text-white">
                      {project.name}
                    </td>
                    <td className="border-b border-white/10 px-4 py-4">
                      <a
                        className="text-cyan-300 hover:text-cyan-200"
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {project.url}
                      </a>
                    </td>
                    <td className="border-b border-white/10 px-4 py-4">
                      <a
                        className="text-emerald-300 hover:text-emerald-200"
                        href={project.repowise}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {project.repowise}
                      </a>
                    </td>
                    <td className="border-b border-white/10 px-4 py-4">
                      <a
                        className="text-violet-300 hover:text-violet-200"
                        href={project.ossprey}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {project.ossprey}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProjectsPage
