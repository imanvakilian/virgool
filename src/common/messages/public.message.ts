export enum publicMessage {
    created = "created successfully",
    deleted = "deleted successfully",
    updated = "updated successfully",
    liked = "liked successfully",
    disliked = "disliked successfully",
    bookmarked = "bookmarked successfully",
    disbookmarked = "disbookmarked successfully",
    followed = "followed successfully",
    unfollowed = "unfollowed successfully",
    blocked = "blocked successfully",
    unblocked = "unblocked successfully",
}

export enum NotFoundMessage {
    notFound = "not found",
    blog = "blog not found",
    comment = "comment not found",
}

export enum badRequestMessage {
    alreadyAcceptedComment = "comment has been accepted already",
    alreadyRejectedComment = "comment has been rejected already",
    youBlocked = "you are blocked...go to sapport section to resolve the problem",
}