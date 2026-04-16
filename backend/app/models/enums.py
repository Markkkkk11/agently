import enum


class ProjectStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    deleted = "deleted"


class AgentType(str, enum.Enum):
    web_developer = "web_developer"
    designer = "designer"
    crm_manager = "crm_manager"
    support = "support"
    marketer = "marketer"
    seo = "seo"
    analyst = "analyst"


class AgentStatus(str, enum.Enum):
    active = "active"
    paused = "paused"


class PlanType(str, enum.Enum):
    free = "free"
    basic = "basic"
    pro = "pro"
    ultra = "ultra"


class SubscriptionStatus(str, enum.Enum):
    active = "active"
    past_due = "past_due"
    frozen = "frozen"
    cancelled = "cancelled"


class MessageRole(str, enum.Enum):
    user = "user"
    assistant = "assistant"
    system = "system"
