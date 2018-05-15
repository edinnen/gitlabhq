module API
  class Markdown < Grape::API
    params do
      requires :text, type: String, desc: "The markdown text to render"
      optional :gfm, type: Boolean, desc: "Render text using GitLab Flavored Markdown"
      optional :project, type: String, desc: "The full path of a project to use as the context when creating references using GitLab Flavored Markdown"
      all_or_none_of :gfm, :project
    end
    resource :markdown do
      desc "Render markdown text" do
        detail "This feature was introduced in GitLab 11.0."
      end
      post do
        # Explicitly set CommonMark as markdown engine to use.
        # Remove this set when https://gitlab.com/gitlab-org/gitlab-ce/issues/43011 is done.
        context = { markdown_engine: :common_mark, only_path: false }

        if params[:gfm]
          project = Project.find_by_full_path(params[:project])

          not_found!("Project") unless can?(current_user, :read_project, project)

          context[:project] = project
        else
          context[:pipeline] = :plain_markdown
        end

        content_type "text/html"

        present Banzai.render(params[:text], context)
      end
    end
  end
end
